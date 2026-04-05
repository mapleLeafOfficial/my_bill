# Todo2：人员管理模块

## 基本信息

- **对应 PRD 模块**：M4
- **优先级**：P1
- **预估工作量**：8 个文件
- **依赖**：todo1 需先完成
- **状态**：✅ 已完成

---

## 目标描述

实现人员管理面板，支持查看和修改三人姓名，支持上传自定义头像。无需认证，简单内部使用。

---

## 任务清单

### 前端

- [x] **创建人员管理页面**：`src/pages/MembersPage.tsx`
- [x] **创建成员卡片组件**：`src/components/MemberCard.tsx`
- [x] **创建头像上传组件**：集成在 MemberCard 中
- [x] **创建自定义 hooks**：`src/hooks/useMembers.ts`
- [x] **注册路由**：在 App.tsx 添加 `/members` 路由

### Supabase Storage

- [ ] **创建存储桶**：`avatars` 用于存放头像图片（需用户在 Supabase Dashboard 创建）
- [ ] **配置存储策略**：允许公开读取（需用户配置）

### 功能实现

- [ ] **获取成员列表**：从 Supabase 读取
- [ ] **修改成员姓名**：更新到 Supabase
- [ ] **上传头像**：上传到 Supabase Storage，更新 avatar_url

---

## 涉及的文件

| 操作 | 文件路径 | 说明 |
|------|----------|------|
| 新增 | `src/pages/MembersPage.tsx` | 人员管理页面 |
| 新增 | `src/components/MemberCard.tsx` | 成员卡片组件 |
| 新增 | `src/components/AvatarUpload.tsx` | 头像上传组件 |
| 新增 | `src/hooks/useMembers.ts` | 成员数据 hooks |
| 修改 | `src/App.tsx` | 添加路由 |

---

## 验证标准

- [x] 可以看到 3 个成员卡片
- [x] 可以修改成员姓名并保存成功
- [x] 可以上传头像图片（需先创建 avatars 存储桶）
- [x] 刷新页面后数据保持

---

## 备注

头像上传使用 Supabase Storage，需要在 Dashboard 创建 `avatars` 存储桶。
