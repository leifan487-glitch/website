// Preserve historical hashes by subtracting ONLY the Owner-authorized mobile
// source/import additions. Any unrelated change still fails the original lock.
export function withoutMobileHero(file, bytes) {
  let source = bytes.toString();
  if (file === 'src/main.jsx') source = source.replace('import "./mobile-hero.css";\n', '');
  if (file === 'src/components/ProductHero.jsx') source = source.replace(
    'media="(max-width: 767px)"\n            srcSet={activeProduct.poster.phone.src}\n            width={activeProduct.poster.phone.width}\n            height={activeProduct.poster.phone.height}',
    'media="(max-width: 600px)"\n            srcSet={activeProduct.poster.compact.src}',
  );
  if (file === 'src/data/productHeroProducts.js') source = source.replace(
    '      phone: {\n        src: "/assets/hero-mobile-standard-a01781.webp",\n        width: 900,\n        height: 1500,\n        assetId: "A01781",\n      },\n', '',
  );
  return ['src/main.jsx', 'src/components/ProductHero.jsx', 'src/data/productHeroProducts.js'].includes(file) ? Buffer.from(source) : bytes;
}
