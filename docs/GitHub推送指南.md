# GitHub 推送指南

## 🚀 快速推送方案

### 方式一：手动创建GitHub仓库（推荐 - 立即可用）

#### 步骤1：在GitHub创建新仓库
1. 访问 https://github.com
2. 点击右上角的 "+" 号，选择 "New repository"
3. 填写仓库信息：
   - **Repository name**: `project-flow`
   - **Description**: `现代化项目管理平台 - 看板与甘特图`
   - **Visibility**: 选择 Private（私有）或 Public（公开）
   - **不要勾选** "Add a README file"（我们已有）
   - **不要勾选** "Add .gitignore"（我们已有）
   - **不要勾选** "Choose a license"（我们已有）

#### 步骤2：获取仓库URL
创建完成后，GitHub会显示快速设置页面，复制HTTPS URL：
```
https://github.com/你的用户名/project-flow.git
```

#### 步骤3：配置远程仓库并推送
在项目根目录执行以下命令：

```bash
cd project-flow

# 添加远程仓库（替换为你的GitHub用户名）
git remote add origin https://github.com/你的用户名/project-flow.git

# 推送代码到GitHub
git push -u origin master
```

### 方式二：使用GitHub CLI（安装后可用）

#### ✅ GitHub CLI已安装
GitHub CLI已经成功安装到您的系统中！

#### 重启后使用
需要重启终端或系统后，GitHub CLI命令 `gh` 才能正常使用。

#### 使用步骤
重启后执行以下命令：

```bash
# 1. 验证安装
gh --version

# 2. 登录GitHub
gh auth login

# 3. 创建仓库并推送
gh repo create project-flow --public --source=. --remote=origin --push

# 或创建私有仓库
gh repo create project-flow --private --source=. --remote=origin --push
```

## 🔧 如果遇到PATH问题

如果重启后gh命令仍然无法识别，可以：

1. **重新打开Git Bash**
2. **或者使用完整路径**：
   ```bash
   /c/Program\ Files/GitHub\ CLI/gh.exe --version
   ```

## 📋 推荐操作流程

**立即选项**: 使用方式一（手动创建），现在就能完成推送
**稍后选项**: 重启系统后使用方式二（GitHub CLI），更便捷

飞哥，您想选择哪种方式？