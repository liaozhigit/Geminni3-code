import { ImageAsset } from './types';

// Helper to create asset objects
const createAsset = (url: string, type: 'preset' | 'upload' | 'generated' = 'preset'): ImageAsset => ({
  id: Math.random().toString(36).substring(7),
  url,
  type,
});

export const PRESET_PEOPLE: ImageAsset[] = [
  createAsset('https://i.mji.rip/2025/11/19/51362f10bf363524251691516b323f46.png'),
  createAsset('https://i.mji.rip/2025/11/19/d42af8d2f41175683d1467bc2c857cbe.png'),
  createAsset('https://p2.itc.cn/q_70/images03/20230712/dfb1cb57f0d045db86efe369415877cf.jpeg'),
  createAsset('https://i.mji.rip/2025/11/19/665c90d26a3ec857c5c440f4f7da5ed2.png'),
  createAsset('https://i.mji.rip/2025/11/19/15f1393ca6e0215caf51cf0ecdfe0d5c.png'),
  createAsset('https://img-s.msn.cn/tenant/amp/entityid/AA1GC7a3.img?w=520&h=780&m=6&x=222&y=183&s=140&d=140'),
];

export const PRESET_CLOTHES: ImageAsset[] = [
  createAsset('https://i.mji.rip/2025/11/19/17aab709b470423cc3e89772afb7da39.png'),
  createAsset('https://i.mji.rip/2025/11/19/cd8598d0d987b7b5825257924be13bcb.png'),
  createAsset('https://i.mji.rip/2025/11/19/32426d416cb5508300c530a071ebe497.png'),
  createAsset('https://i.mji.rip/2025/11/19/6bd78dd58ee4e038e219145822b356e6.png'),
  createAsset('https://i.mji.rip/2025/11/19/e6dccb4533c546cb42fa564b322d8e84.png'),
  createAsset('https://i.mji.rip/2025/11/19/a838237484463bfe6ce45a8245587048.png'),
];
