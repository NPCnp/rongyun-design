var supabase = null;
var supabaseEnabled = false;

function initSupabase() {
    if (!window.supabase || SUPABASE_URL === '' || SUPABASE_ANON_KEY === '') {
        console.log('Supabase 未配置或 SDK 未加载，使用本地存储');
        return;
    }
    try {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        supabaseEnabled = true;
        console.log('Supabase 初始化成功');
    } catch (e) {
        console.error('Supabase 初始化失败:', e);
        supabaseEnabled = false;
    }
}

async function saveOrderToSupabase(orderData) {
    if (!supabaseEnabled || !supabase) {
        console.log('Supabase 不可用，跳过云端保存');
        return null;
    }
    try {
        const { data, error } = await supabase
            .from('orders')
            .insert([{
                order_no: orderData.orderNo,
                name: orderData.name,
                phone: orderData.phone,
                pickup_code: String(orderData.pickupCode),
                design: orderData.design,
                status: '待制作'
            }])
            .select();
        
        if (error) {
            console.error('保存到 Supabase 失败:', error);
            return null;
        }
        console.log('订单已保存到 Supabase:', data[0]);
        return data[0];
    } catch (e) {
        console.error('保存订单失败:', e);
        return null;
    }
}

function openOrderModal() {
    var orderNo = (parseInt(localStorage.getItem(ORDER_NO_KEY) || '0') + 1);
    document.getElementById('orderNoInput').value = orderNo;
    document.getElementById('orderNameInput').value = '';
    document.getElementById('orderPhoneInput').value = '';
    
    fabricCanvas.renderAll();
    
    try {
        document.getElementById('orderPreviewImage').src = fabricCanvas.toDataURL({ 
            format: 'png', 
            multiplier: 2,
            backgroundColor: '#FFFFFF'
        });
    } catch (e) {
        console.error('订单预览图生成失败:', e);
    }
    
    document.getElementById('pickupCodeDisplay').style.display = 'none';
    document.getElementById('orderModal').classList.add('active');
}

function closeOrderModal() {
    document.getElementById('orderModal').classList.remove('active');
}

async function submitOrder() {
    var orderNo = (parseInt(localStorage.getItem(ORDER_NO_KEY) || '0') + 1);
    var name = document.getElementById('orderNameInput').value.trim();
    var phone = document.getElementById('orderPhoneInput').value.trim();
    
    if (!name) {
        showToast('请输入姓名');
        return;
    }
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
        showToast('请输入正确的手机号');
        return;
    }
    
    localStorage.setItem(ORDER_NO_KEY, orderNo);
    var design = fabricCanvas.toDataURL({ format: 'png', multiplier: 2 });
    var pickupCode = Math.floor(100000 + Math.random() * 900000);
    
    var orderData = {
        orderNo: orderNo,
        name: name,
        phone: phone,
        design: design,
        time: new Date().toLocaleString(),
        timestamp: new Date().toISOString(),
        status: '待制作',
        pickupCode: pickupCode
    };
    
    var orders = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    orders.push(orderData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));

    const cloudResult = await saveOrderToSupabase(orderData);
    
    document.getElementById('pickupCodeText').innerText = pickupCode;
    document.getElementById('orderDataText').innerText = JSON.stringify(orderData);
    document.getElementById('pickupCodeDisplay').style.display = 'block';
    
    vibrate([50, 50, 50]);
    
    if (cloudResult) {
        showToast('订单已提交！数据已同步云端');
    } else {
        showToast('订单已提交！（本地存储）');
    }
}

function copyPickupCode() {
    var pickupCode = document.getElementById('pickupCodeText').innerText;
    navigator.clipboard.writeText(pickupCode).then(function() {
        showToast('取件码已复制');
        vibrate();
    }).catch(function() {
        showToast('复制失败，请手动记录');
    });
}

function initOrderEventListeners() {
    document.getElementById('orderModalClose').addEventListener('click', closeOrderModal);
    document.getElementById('submitOrderBtn').addEventListener('click', submitOrder);
    document.getElementById('copyPickupBtn').addEventListener('click', copyPickupCode);
}