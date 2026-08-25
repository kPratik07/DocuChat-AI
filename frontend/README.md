# DocuChat AI Frontend

The React and Vite client for DocuChat AI. It provides authentication, email verification, OTP password recovery, PDF upload, document viewing, and AI chat.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Setup

```bash
npm install
npm run dev
```

The development server runs at `http://localhost:5173`.

## Commands

```bash
npm run dev
npm run lint
npm run build
npm run preview
```

Set `VITE_API_URL` when the backend is not running at `http://localhost:5000`.

Styling uses Tailwind CSS. React-PDF annotation and text-layer styles remain imported because they are required for PDF rendering.
