/**
 * Vanta.js tidak membawa berkas tipe apa pun. Deklarasi minimum ini cukup untuk
 * satu-satunya efek yang kita pakai; menuliskan seluruh permukaan API-nya hanya
 * menambah kode yang harus dirawat tanpa satu pun pemakai.
 */
declare module "vanta/dist/vanta.birds.min" {
  type VantaEffect = { destroy: () => void; resize?: () => void };
  type VantaOptions = {
    el: HTMLElement;
    THREE: unknown;
    [key: string]: unknown;
  };
  const BIRDS: (options: VantaOptions) => VantaEffect;
  export default BIRDS;
}
