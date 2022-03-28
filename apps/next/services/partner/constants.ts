// will just include both staging and production for now
export const commissionLookupMap: Record<string, number> = {
    // test env
    price_1JwkpXJzF2VT0EeKXFGDsr5A: 2.0, // monthly personal
    price_1JwgTKJzF2VT0EeKxAbRNX6d: 6.0, // yearly personal
    price_1JwgPBJzF2VT0EeK31OQd0UG: 6.0, // monthly professional
    price_1JwgShJzF2VT0EeKsIvKjFDc: 20.0, // yearly professional

    // prod env
    price_1JzCH9JzF2VT0EeKosIm5pDT: 2.0, // monthly personal
    price_1JzCH9JzF2VT0EeKf0CtL9fC: 6.0, // yearly personal
    price_1JzCGEJzF2VT0EeKP4bkT0qp: 6.0, // monthly professional
    price_1JzCGEJzF2VT0EeKRDOmP4JN: 20.0, // yearly professional
};

// Partner media kit images from s3
export const basicPartnerCodeBackground = 'https://partner-media-kit-constants.sfo3.digitaloceanspaces.com/Basic%20Partner%20Code.png';
export const partnerCodeWithMembershipBackground = 'https://partner-media-kit-constants.sfo3.digitaloceanspaces.com/Partner%20Code%20with%20Membership.png';
