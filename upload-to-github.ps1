# 榕韵亲子定制 - 上传到 GitHub 脚本
cd "c:\Users\15759\Desktop\DIY"

# 配置 Git 用户信息
git config user.name "NPCnp"
git config user.email "npcnp@users.noreply.github.com"

# 设置大文件上传缓冲（500MB）
git config http.postBuffer 524288000

# 添加远程仓库
git remote add origin https://github.com/NPCnp/rongyun-design.git

# 添加所有文件（会自动忽略 .gitignore 中的文件）
git add .

# 提交
git commit -m "优化移动端界面：手势操作、自动保存、样例设计、海报生成"

# 推送到远程仓库
git push -u origin main

Write-Host "上传完成！"
