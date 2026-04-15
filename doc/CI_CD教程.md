# CI/CD 教程

这个项目是一个 `Vite + React + TypeScript` 前端项目，部署方式已经偏向“构建产物 `dist/` + Nginx 容器托管”。

所以最合适的 CI/CD 方案是：

1. GitHub Actions 负责自动安装依赖、构建项目
2. 构建成功后，把 `dist/` 上传到你的 Linux 服务器
3. 服务器上的 `docker compose` 挂载 `dist/`，由 Nginx 对外提供访问

仓库中对应文件：

- CI/CD 工作流：`.github/workflows/deploy.yml`
- 容器编排：`docker-compose.yml`
- Nginx 配置：`nginx.conf`
- 前端部署配置：`vercel.json`（如果后续改走 Vercel 也能用）

## 一、先确认部署架构

当前仓库的部署方式不是“后端服务发布”，而是“静态前端发布”：

- 本地或 GitHub Actions 执行 `npm run build`
- 生成 `dist/`
- `docker-compose.yml` 把 `./dist` 挂载到 Nginx 容器内的 `/usr/share/nginx/html`
- Nginx 通过 `8899:80` 对外提供访问

也就是说，CI/CD 的核心不是发布可执行程序，而是“自动替换服务器上的 `dist/` 文件夹”。

## 二、服务器端准备

先在 Linux 服务器上准备项目目录，例如：

```bash
mkdir -p /home/ubuntu/my_bill
cd /home/ubuntu/my_bill
```

把下面这些文件先上传到服务器一次：

- `docker-compose.yml`
- `nginx.conf`

然后在服务器目录执行：

```bash
docker compose up -d
```

这一步的作用：

- 启动 `nginx:alpine` 容器
- 将当前目录下的 `dist/` 映射到容器静态目录
- 打开服务器 `8899` 端口

如果你还没有 `dist/`，可以先临时本地构建一次再传上去，或者先在服务器里创建一个空目录：

```bash
mkdir -p dist
docker compose up -d
```

## 三、GitHub 仓库 Secrets 配置

打开 GitHub 仓库：

`Settings -> Secrets and variables -> Actions`

添加下面这些 `Repository secrets`：

1. `SERVER_HOST`
   你的服务器公网 IP 或域名

2. `SERVER_USER`
   登录服务器的用户，例如 `root`、`ubuntu`

3. `SSH_PRIVATE_KEY`
   GitHub Actions 用来登录服务器的私钥内容

4. `SERVER_PORT`
   SSH 端口，默认是 `22`

5. `DEPLOY_PATH`
   服务器上的项目目录绝对路径，例如：

```bash
/home/ubuntu/my_bill
```

6. `VITE_SUPABASE_URL`
   生产环境 Supabase URL

7. `VITE_SUPABASE_ANON_KEY`
   生产环境 Supabase 匿名 Key

注意：

- `VITE_` 前缀变量会在前端构建时注入到浏览器代码中
- 所以这里只能放前端允许公开的值，例如 `anon key`
- 不要把 `service_role key` 放到前端项目里

## 四、SSH 密钥怎么准备

如果你还没有专门给 GitHub Actions 用的密钥，可以在本机生成一对：

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy"
```

会得到两个文件：

- 私钥：`id_ed25519`
- 公钥：`id_ed25519.pub`

然后：

1. 把 `id_ed25519.pub` 追加到服务器用户的 `~/.ssh/authorized_keys`
2. 把 `id_ed25519` 的内容复制到 GitHub 的 `SSH_PRIVATE_KEY`

服务器上执行：

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
cat >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

把公钥粘进去即可。

## 五、GitHub Actions 工作流说明

仓库里已经改成了这个流程：

1. 推送到 `main` 或 `master` 时自动触发
2. 执行 `npm ci`
3. 注入 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`
4. 执行 `npm run build`
5. 上传 `dist` 为构建产物
6. 通过 SSH/SCP 拷贝到服务器 `DEPLOY_PATH`
7. 在服务器执行 `docker compose up -d nginx`

这份工作流相比原来的版本，主要修复了几个问题：

- 去掉了硬编码服务器路径
- 去掉了乱码目录名
- 增加了手动触发 `workflow_dispatch`
- 增加了构建环境变量注入
- 增加了并发控制，避免重复部署互相覆盖

## 六、推荐的目录结构

服务器上建议最终长这样：

```text
/home/ubuntu/my_bill
├─ dist/
├─ docker-compose.yml
└─ nginx.conf
```

其中：

- `dist/` 由 GitHub Actions 持续覆盖
- `docker-compose.yml` 和 `nginx.conf` 通常手工维护，除非你后面也想纳入自动化发布

## 七、完整发布流程

以后每次上线只需要：

1. 本地提交代码
2. 推送到 `main`
3. GitHub Actions 自动构建
4. 自动把新 `dist/` 上传到服务器
5. Nginx 容器继续提供最新页面

常用命令：

```bash
git add .
git commit -m "feat: update bill app"
git push origin main
```

## 八、第一次部署怎么排错

如果 GitHub Actions 失败，按下面顺序查：

1. `npm ci` 失败
   一般是 `package-lock.json` 和 `package.json` 不一致

2. `npm run build` 失败
   一般是 TypeScript 报错，或者缺少 `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`

3. SCP 失败
   一般是 `SERVER_HOST`、`SERVER_USER`、`SSH_PRIVATE_KEY`、`SERVER_PORT` 配置有问题

4. 部署成功但页面打不开
   检查服务器安全组、防火墙、Nginx 对外端口 `8899` 是否已开放

5. 页面打开但接口报错
   检查 Supabase 生产环境地址和 Key 是否正确

服务器侧建议排查命令：

```bash
cd /home/ubuntu/my_bill
docker compose ps
docker compose logs nginx
ls -la dist
```

## 九、如果你想更规范，可以再补两个动作

### 1. 增加单独的 CI 校验

建议后续新增一个只做校验的工作流，在 Pull Request 阶段执行：

- `npm ci`
- `npm run build`
- `npm run lint`

但这个仓库目前还没有 ESLint 配置文件，所以先不要把 `lint` 强行加入工作流，否则 CI 会直接失败。

### 2. 增加 Production 环境保护

在 GitHub 里配置：

`Settings -> Environments -> production`

然后：

- 给 `production` 配置审批人
- 把部署 job 绑定到 `production`

这样每次发布到正式环境前，可以人工确认一次。

## 十、这个项目最适合的 CI/CD 结论

对这个仓库，我建议你就用下面这条路线，不要一开始搞复杂：

1. 代码托管在 GitHub
2. GitHub Actions 做构建
3. Actions 通过 SSH 把 `dist/` 发到服务器
4. 服务器用 Docker + Nginx 托管静态资源

原因很简单：

- 你的项目是纯前端，部署目标清晰
- 仓库里已经有 `docker-compose.yml` 和 `nginx.conf`
- 改造成本最低
- 后面如果你要切到 Vercel，也很容易

## 十一、后续可选升级

如果后面你想继续完善，可以再做这几项：

- 增加 PR 检查工作流
- 增加测试用例后，把测试纳入 CI
- 给生产部署增加人工审批
- 把 `docker-compose.yml`、`nginx.conf` 也纳入自动同步
- 把部署从直接覆盖 `dist/` 升级为“版本目录 + 软链接切换”

如果你愿意，我下一步可以继续帮你做两件事中的任意一件：

1. 直接再补一份 `ci.yml`，只做 PR 构建校验
2. 按你的服务器实际信息，把这份 `deploy.yml` 改成可直接上线的最终版
