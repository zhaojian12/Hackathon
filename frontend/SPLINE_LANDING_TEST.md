# Spline 3D Landing Page - 测试指南

## ✅ 配置完成

已成功将 AttentionLive 的 Spline 3D 主页面配置到 Hackathon 项目。

## 📁 文件清单

### 新增/修改的文件：
1. ✅ `src/components/LandingPage.tsx` - Spline 3D 场景组件
2. ✅ `src/components/LandingPage.css` - 样式文件
3. ✅ `src/App.tsx` - 已集成 landing page
4. ✅ `src/main.tsx` - 已恢复正确的入口文件
5. ✅ `public/scene6.splinecode` - 3D 场景文件（已存在）

## 🚀 启动测试

```bash
cd Hackathon/frontend
npm run dev
```

访问：`http://localhost:5173/`

## 🎯 预期效果

1. **首次加载**：显示 Spline 3D 场景（scene6.splinecode）
2. **交互方式**：
   - 点击 3D 场景任意位置 → 进入主应用
   - 点击透明按钮区域（左上区域）→ 进入主应用
   - 键盘操作：Tab 聚焦 → Enter/Space 进入
3. **进入后**：显示主交易界面（Trade Creator + Trade List）

## 🔧 关键技术点

### 1. Spline 集成
```tsx
import Spline from '@splinetool/react-spline';

<Spline
  scene="/scene6.splinecode"
  onClick={onSplineClick}
  onMouseDown={onSplineMouseDown}
/>
```

### 2. 路由差异处理
- **AttentionLive**: Next.js → `useRouter` from `next/navigation`
- **Hackathon**: Vite + React → 使用 `useState` + 条件渲染

### 3. 状态管理
```tsx
const [showLanding, setShowLanding] = useState(true);

if (showLanding) {
  return <LandingPage onEnter={() => setShowLanding(false)} />;
}
```

## 📱 响应式设计

- **桌面端**：按钮区域 18vw × 10vh，位于 (20%, 55%)
- **移动端**：按钮区域 30vw × 15vh，位于 (50%, 60%)

## 🎨 自定义调整

### 更换 3D 场景
将新的 `.splinecode` 文件放入 `public/` 目录，然后更新：
```tsx
scene="/your-new-scene.splinecode"
```

### 调整按钮位置
编辑 `LandingPage.css` 中的 `.landing-clickable-area`：
```css
top: 55%;    /* 垂直位置 */
left: 20%;   /* 水平位置 */
width: 18vw; /* 宽度 */
height: 10vh; /* 高度 */
```

## ⚠️ 注意事项

1. **依赖已安装**：`@splinetool/react-spline` 已在 package.json 中
2. **场景文件**：`scene6.splinecode` 必须在 `public/` 目录
3. **首次加载**：3D 场景可能需要几秒钟加载时间
4. **浏览器兼容**：建议使用 Chrome/Edge 获得最佳效果

## 🐛 故障排除

### 场景不显示
```bash
# 检查文件是否存在
ls public/scene6.splinecode

# 检查依赖
npm list @splinetool/react-spline
```

### 点击无响应
- 检查浏览器控制台是否有错误
- 尝试键盘操作（Tab + Enter）
- 调整 `.landing-clickable-area` 的位置

### TypeScript 错误
```bash
# 重新安装依赖
npm install

# 检查诊断
npm run build
```

## 📊 性能优化

- Spline 场景会自动优化加载
- 首次访问可能较慢，后续会有缓存
- 可以添加 loading 状态提升用户体验

## 🎉 完成！

现在你的 Hackathon 项目已经拥有了和 AttentionLive 一样炫酷的 3D 入口页面！
