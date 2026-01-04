# Fractal

#### [Link](https://nullptr-t-oss.github.io/Fractal/)

### How to build

```bash
apt install mesa-common-dev libxi-dev
git clone https://github.com/nullptr-t-oss/Fractal.git
cd Fractal
npm install
npm run dev
```

> [!NOTE]
> Update: Using GPU.js to improve rendering speed dramatically!

> [!NOTE]
> Update: Using Material for website theming (wanted to use M3 Expressive 🙃)

> [!NOTE]
> Update: Added pan and zoom functionality (read canvas.ts comments to find out the math behind its implementation)

> [!NOTE]
> Update: Added "Save as Image"

Features I want to add:
- Splitting numbers into hi and lo components to increase precision (for now, we can't zoom very far before being limited by the floating-point precision limit)

###### NEVER SETTLE