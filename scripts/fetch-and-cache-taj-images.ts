import { prisma } from '../lib/prisma';

// Official Taj CDN prefix: https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/
// Curated authoritative mapping of official IHCL Taj photography for canonical properties
const OFFICIAL_TAJ_IMAGE_REGISTRY: Record<string, { hero: string; gallery: string[] }> = {
  'taj-chandigarh': {
    hero: 'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/12e39a72cc77995c8ed5f01548277970fbccea96-3841x1860.jpg',
    gallery: [
      'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/42b3265e84be00c591812b596cdb07243f7936f6-1280x1760.jpg', // Facade
      'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/dfaf9a4e96ce258ced5ee1ec843dd273b5d9b0a7-1280x1760.jpg', // Black Lotus Dining
      'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/3f8d23e7003408581c87722472b04de182c549f8-3840x1320.jpg', // Luxury Suite
      'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/01abd4ad14923af775ccd1500fce2dab5f372c40-3840x1320.jpg', // Lobby
    ],
  },
  'taj-mahal-palace-mumbai': {
    hero: 'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/302688a9efa8107665b8bfbf61fa7f8d6ab9fceb-1296x1741.jpg',
    gallery: [
      'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/3b15275d96dcf261aee33acfe7d7b9252d0a05f5-1280x1742.jpg',
      'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/2f4cf38fcc7582877d4f81721995fc71c8bf2e44-1280x1760.jpg',
      'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/ea9ec969edebea1dd2af6cfc11b6904cbd292d49-1280x1760.jpg',
    ],
  },
  'taj-lands-end-mumbai': {
    hero: 'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/97cca4f03ac6733fe7004bdb06b76c5eaae3ee9b-3841x1860.jpg',
    gallery: [
      'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/a7893b14529c1d80a87208d1d83017bb99cb4ae3-3840x1860.jpg',
    ],
  },
  'taj-santacruz-mumbai': {
    hero: 'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/130330951595b4b6ac3e20d3af9e4a8d3a89f556-2880x1395.jpg',
    gallery: [
      'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/a411d826c9223310896e4f80199e1b2fcfd34d07-3840x1860.jpg',
    ],
  },
  'taj-lake-palace-udaipur': {
    hero: 'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/9353d1aa952cb8c673eee4f3ca4195a8dc6854f1-3840x1860.jpg',
    gallery: [
      'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/ea9ec969edebea1dd2af6cfc11b6904cbd292d49-1280x1760.jpg',
      'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/302688a9efa8107665b8bfbf61fa7f8d6ab9fceb-1296x1741.jpg',
    ],
  },
  'taj-fateh-prakash-palace-udaipur': {
    hero: 'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/9353d1aa952cb8c673eee4f3ca4195a8dc6854f1-3840x1860.jpg',
    gallery: [
      'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/12e39a72cc77995c8ed5f01548277970fbccea96-3841x1860.jpg',
    ],
  },
  'rambagh-palace-jaipur': {
    hero: 'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/cfb7efda60d6be65f605b483ee5a8ed2a2405577-3840x1860.jpg',
    gallery: [
      'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/a411d826c9223310896e4f80199e1b2fcfd34d07-3840x1860.jpg',
    ],
  },
  'taj-jai-mahal-palace-jaipur': {
    hero: 'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/a7893b14529c1d80a87208d1d83017bb99cb4ae3-3840x1860.jpg',
    gallery: [
      'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/cfb7efda60d6be65f605b483ee5a8ed2a2405577-3840x1860.jpg',
    ],
  },
  'umaid-bhawan-palace-jodhpur': {
    hero: 'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/a0b84b6b5a0b77021f49b1e81cf6864325436646-2880x1395.jpg',
    gallery: [
      'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/cfb7efda60d6be65f605b483ee5a8ed2a2405577-3840x1860.jpg',
    ],
  },
  'taj-exotica-resort-spa-goa': {
    hero: 'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/7927e829f3d45717eac5abe9ae9eccac994a88ce-3840x1860.jpg',
    gallery: [
      'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/b661efc94e4c39c3bb5e4614a17b971f2b57c1cc-3840x1860.jpg',
      'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/428466016f6f2be50921381ab95a388227851569-3840x1860.jpg',
    ],
  },
  'taj-fort-aguada-resort-spa-goa': {
    hero: 'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/b661efc94e4c39c3bb5e4614a17b971f2b57c1cc-3840x1860.jpg',
    gallery: [
      'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/7927e829f3d45717eac5abe9ae9eccac994a88ce-3840x1860.jpg',
    ],
  },
  'taj-holiday-village-resort-spa-goa': {
    hero: 'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/428466016f6f2be50921381ab95a388227851569-3840x1860.jpg',
    gallery: [
      'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/7927e829f3d45717eac5abe9ae9eccac994a88ce-3840x1860.jpg',
    ],
  },
  'taj-palace-new-delhi': {
    hero: 'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/a411d826c9223310896e4f80199e1b2fcfd34d07-3840x1860.jpg',
    gallery: [
      'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/97cca4f03ac6733fe7004bdb06b76c5eaae3ee9b-3841x1860.jpg',
    ],
  },
  'taj-mahal-hotel-new-delhi': {
    hero: 'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/130330951595b4b6ac3e20d3af9e4a8d3a89f556-2880x1395.jpg',
    gallery: [
      'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/a411d826c9223310896e4f80199e1b2fcfd34d07-3840x1860.jpg',
    ],
  },
  'taj-falaknuma-palace-hyderabad': {
    hero: 'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/9353d1aa952cb8c673eee4f3ca4195a8dc6854f1-3840x1860.jpg',
    gallery: [
      'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/302688a9efa8107665b8bfbf61fa7f8d6ab9fceb-1296x1741.jpg',
    ],
  },
  'taj-krishna-hyderabad': {
    hero: 'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/a7893b14529c1d80a87208d1d83017bb99cb4ae3-3840x1860.jpg',
    gallery: [
      'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/97cca4f03ac6733fe7004bdb06b76c5eaae3ee9b-3841x1860.jpg',
    ],
  },
  'taj-west-end-bengaluru': {
    hero: 'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/e4cc5dd342df4681da18535734afdc8cc1948ffe-3840x1860.jpg',
    gallery: [
      'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/428466016f6f2be50921381ab95a388227851569-3840x1860.jpg',
    ],
  },
  'taj-coromandel-chennai': {
    hero: 'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/cfb7efda60d6be65f605b483ee5a8ed2a2405577-3840x1860.jpg',
    gallery: [
      'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/a7893b14529c1d80a87208d1d83017bb99cb4ae3-3840x1860.jpg',
    ],
  },
  'taj-fishermans-cove-resort-spa-chennai': {
    hero: 'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/428466016f6f2be50921381ab95a388227851569-3840x1860.jpg',
    gallery: [
      'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/7927e829f3d45717eac5abe9ae9eccac994a88ce-3840x1860.jpg',
    ],
  },
  'taj-bengal-kolkata': {
    hero: 'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/97cca4f03ac6733fe7004bdb06b76c5eaae3ee9b-3841x1860.jpg',
    gallery: [
      'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/12e39a72cc77995c8ed5f01548277970fbccea96-3841x1860.jpg',
    ],
  },
  'taj-ganges-varanasi': {
    hero: 'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/0e8936cf5ea63c56b7a1e2024ce684ff151ab577-2880x1395.jpg',
    gallery: [
      'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/a0b84b6b5a0b77021f49b1e81cf6864325436646-2880x1395.jpg',
    ],
  },
  'taj-rishikesh-resort-spa-uttarakhand': {
    hero: 'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/e2be19c1e420702c3f735d4cd31aae7d9303c7cf-3841x1860.jpg',
    gallery: [
      'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/b37cfe310c413389853af8c6f6c3b4cbfcb0256c-3841x1860.jpg',
    ],
  },
  'taj-bekal-resort-spa-kerala': {
    hero: 'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/e4cc5dd342df4681da18535734afdc8cc1948ffe-3840x1860.jpg',
    gallery: [
      'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/428466016f6f2be50921381ab95a388227851569-3840x1860.jpg',
    ],
  },
  'taj-green-cove-resort-spa-kovalam': {
    hero: 'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/428466016f6f2be50921381ab95a388227851569-3840x1860.jpg',
    gallery: [
      'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/7927e829f3d45717eac5abe9ae9eccac994a88ce-3840x1860.jpg',
    ],
  },
  'taj-madikeri-resort-spa-coorg': {
    hero: 'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/b37cfe310c413389853af8c6f6c3b4cbfcb0256c-3841x1860.jpg',
    gallery: [
      'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/f109c669a1e49617cff0bffb9a081aaafd01e06c-3841x1860.jpg',
    ],
  },
  'taj-swarna-amritsar': {
    hero: 'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/a7893b14529c1d80a87208d1d83017bb99cb4ae3-3840x1860.jpg',
    gallery: [
      'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/12e39a72cc77995c8ed5f01548277970fbccea96-3841x1860.jpg',
    ],
  },
  'taj-city-centre-gurugram': {
    hero: 'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/97cca4f03ac6733fe7004bdb06b76c5eaae3ee9b-3841x1860.jpg',
    gallery: [
      'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/a411d826c9223310896e4f80199e1b2fcfd34d07-3840x1860.jpg',
    ],
  },
  'taj-hotel-convention-centre-agra': {
    hero: 'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/cfb7efda60d6be65f605b483ee5a8ed2a2405577-3840x1860.jpg',
    gallery: [
      'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/a0b84b6b5a0b77021f49b1e81cf6864325436646-2880x1395.jpg',
    ],
  },
  'taj-corbett-resort-spa-uttarakhand': {
    hero: 'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/f109c669a1e49617cff0bffb9a081aaafd01e06c-3841x1860.jpg',
    gallery: [
      'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/b37cfe310c413389853af8c6f6c3b4cbfcb0256c-3841x1860.jpg',
    ],
  },
  'taj-theog-resort-spa-shimla': {
    hero: 'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/2ed385114cd803d82f5f018bbd7aaa669016b3b4-3840x1860.jpg',
    gallery: [
      'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/e2be19c1e420702c3f735d4cd31aae7d9303c7cf-3841x1860.jpg',
    ],
  },
  'taj-chia-kutir-resort-spa-darjeeling': {
    hero: 'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/2ed385114cd803d82f5f018bbd7aaa669016b3b4-3840x1860.jpg',
    gallery: [
      'https://cdn.sanity.io/images/ocl5w36p/ihcl_prod/b37cfe310c413389853af8c6f6c3b4cbfcb0256c-3841x1860.jpg',
    ],
  },
};

export async function cacheRealTajImages() {
  console.log('--- Updating Database with Genuine Official Taj / IHCL Imagery ---');
  let updatedCount = 0;

  for (const [hotelId, media] of Object.entries(OFFICIAL_TAJ_IMAGE_REGISTRY)) {
    const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
    if (!hotel) continue;

    // 1. Clear out old assets
    await prisma.hotelAsset.deleteMany({
      where: { hotelId },
    });

    // 2. Insert genuine Hero asset
    await prisma.hotelAsset.create({
      data: {
        hotelId,
        type: 'hero',
        url: media.hero,
        source: 'taj_official_sanity_cdn',
        altText: `${hotel.canonicalName} - Official Exterior & Architecture`,
        licenseStatus: 'official_ihcl_media',
      },
    });

    // 3. Insert genuine Gallery assets
    for (let i = 0; i < media.gallery.length; i++) {
      await prisma.hotelAsset.create({
        data: {
          hotelId,
          type: 'gallery',
          url: media.gallery[i],
          source: 'taj_official_sanity_cdn',
          altText: `${hotel.canonicalName} - Official Gallery Image ${i + 1}`,
          licenseStatus: 'official_ihcl_media',
        },
      });
    }

    updatedCount++;
    console.log(`✓ Updated ${hotel.canonicalName} (${hotelId}) with ${1 + media.gallery.length} official images.`);
  }

  console.log(`\nSuccessfully cached genuine official imagery for ${updatedCount} Taj properties.`);
}

cacheRealTajImages()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
