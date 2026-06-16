export interface ExtensionSource {
  universityName: string;
  baseUrl: string;
  searchUrl: string;
}

export const extensionSources: Record<string, ExtensionSource> = {
  AL: {
    universityName: "Auburn University",
    baseUrl: "https://www.aces.edu",
    searchUrl: "https://www.aces.edu/search/?q=",
  },
  AK: {
    universityName: "University of Alaska Fairbanks",
    baseUrl: "https://www.uaf.edu/ces",
    searchUrl: "https://www.uaf.edu/ces/search/?q=",
  },
  AZ: {
    universityName: "University of Arizona",
    baseUrl: "https://extension.arizona.edu",
    searchUrl: "https://extension.arizona.edu/search?q=",
  },
  AR: {
    universityName: "University of Arkansas",
    baseUrl: "https://www.uaex.uada.edu",
    searchUrl: "https://www.uaex.uada.edu/search?q=",
  },
  CA: {
    universityName: "UC Cooperative Extension",
    baseUrl: "https://ucanr.edu",
    searchUrl: "https://ucanr.edu/search/?q=",
  },
  CO: {
    universityName: "Colorado State University",
    baseUrl: "https://extension.colostate.edu",
    searchUrl: "https://extension.colostate.edu/?s=",
  },
  CT: {
    universityName: "University of Connecticut",
    baseUrl: "https://extension.uconn.edu",
    searchUrl: "https://extension.uconn.edu/?s=",
  },
  DE: {
    universityName: "University of Delaware",
    baseUrl: "https://extension.udel.edu",
    searchUrl: "https://extension.udel.edu/?s=",
  },
  DC: {
    universityName: "University of Maryland Extension",
    baseUrl: "https://extension.umd.edu",
    searchUrl: "https://extension.umd.edu/?s=",
  },
  FL: {
    universityName: "University of Florida IFAS",
    baseUrl: "https://edis.ifas.ufl.edu",
    searchUrl: "https://edis.ifas.ufl.edu/search?q=",
  },
  GA: {
    universityName: "University of Georgia",
    baseUrl: "https://extension.uga.edu",
    searchUrl: "https://extension.uga.edu/?s=",
  },
  HI: {
    universityName: "University of Hawaii",
    baseUrl: "https://www.ctahr.hawaii.edu",
    searchUrl: "https://www.ctahr.hawaii.edu/site/search.aspx?q=",
  },
  ID: {
    universityName: "University of Idaho",
    baseUrl: "https://www.uidaho.edu/extension",
    searchUrl: "https://www.uidaho.edu/search#q=",
  },
  IL: {
    universityName: "University of Illinois",
    baseUrl: "https://extension.illinois.edu",
    searchUrl: "https://extension.illinois.edu/search?q=",
  },
  IN: {
    universityName: "Purdue University",
    baseUrl: "https://extension.purdue.edu",
    searchUrl: "https://extension.purdue.edu/search?q=",
  },
  IA: {
    universityName: "Iowa State University",
    baseUrl: "https://www.extension.iastate.edu",
    searchUrl: "https://www.extension.iastate.edu/?s=",
  },
  KS: {
    universityName: "Kansas State University",
    baseUrl: "https://www.ksre.k-state.edu",
    searchUrl: "https://www.ksre.k-state.edu/search?q=",
  },
  KY: {
    universityName: "University of Kentucky",
    baseUrl: "https://extension.ca.uky.edu",
    searchUrl: "https://extension.ca.uky.edu/?s=",
  },
  LA: {
    universityName: "LSU AgCenter",
    baseUrl: "https://www.lsuagcenter.com",
    searchUrl: "https://www.lsuagcenter.com/search?q=",
  },
  ME: {
    universityName: "University of Maine",
    baseUrl: "https://extension.umaine.edu",
    searchUrl: "https://extension.umaine.edu/?s=",
  },
  MD: {
    universityName: "University of Maryland",
    baseUrl: "https://extension.umd.edu",
    searchUrl: "https://extension.umd.edu/?s=",
  },
  MA: {
    universityName: "UMass Amherst",
    baseUrl: "https://extension.umass.edu",
    searchUrl: "https://extension.umass.edu/?s=",
  },
  MI: {
    universityName: "Michigan State University",
    baseUrl: "https://www.canr.msu.edu/outreach",
    searchUrl: "https://www.canr.msu.edu/search?q=",
  },
  MN: {
    universityName: "University of Minnesota",
    baseUrl: "https://extension.umn.edu",
    searchUrl: "https://extension.umn.edu/search?q=",
  },
  MS: {
    universityName: "Mississippi State University",
    baseUrl: "https://www.extension.msstate.edu",
    searchUrl: "https://www.extension.msstate.edu/search?q=",
  },
  MO: {
    universityName: "University of Missouri",
    baseUrl: "https://extension.missouri.edu",
    searchUrl: "https://extension.missouri.edu/search?q=",
  },
  MT: {
    universityName: "Montana State University",
    baseUrl: "https://www.msuextension.org",
    searchUrl: "https://www.msuextension.org/search?q=",
  },
  NE: {
    universityName: "University of Nebraska-Lincoln",
    baseUrl: "https://extension.unl.edu",
    searchUrl: "https://extension.unl.edu/search?q=",
  },
  NV: {
    universityName: "University of Nevada",
    baseUrl: "https://www.unce.unr.edu",
    searchUrl: "https://www.unce.unr.edu/search?q=",
  },
  NH: {
    universityName: "University of New Hampshire",
    baseUrl: "https://extension.unh.edu",
    searchUrl: "https://extension.unh.edu/?s=",
  },
  NJ: {
    universityName: "Rutgers University",
    baseUrl: "https://njaes.rutgers.edu",
    searchUrl: "https://njaes.rutgers.edu/search/?q=",
  },
  NM: {
    universityName: "New Mexico State University",
    baseUrl: "https://extension.nmsu.edu",
    searchUrl: "https://extension.nmsu.edu/search?q=",
  },
  NY: {
    universityName: "Cornell Cooperative Extension",
    baseUrl: "https://cals.cornell.edu/cooperative-extension",
    searchUrl: "https://cals.cornell.edu/cooperative-extension/search?q=",
  },
  NC: {
    universityName: "NC State Extension",
    baseUrl: "https://content.ces.ncsu.edu",
    searchUrl: "https://content.ces.ncsu.edu/search?q=",
  },
  ND: {
    universityName: "North Dakota State University",
    baseUrl: "https://www.ag.ndsu.edu/extension",
    searchUrl: "https://www.ndsu.edu/search/?q=",
  },
  OH: {
    universityName: "Ohio State University",
    baseUrl: "https://extension.osu.edu",
    searchUrl: "https://extension.osu.edu/search?q=",
  },
  OK: {
    universityName: "Oklahoma State University",
    baseUrl: "https://extension.okstate.edu",
    searchUrl: "https://extension.okstate.edu/search?q=",
  },
  OR: {
    universityName: "Oregon State University",
    baseUrl: "https://extension.oregonstate.edu",
    searchUrl: "https://extension.oregonstate.edu/search?q=",
  },
  PA: {
    universityName: "Penn State Extension",
    baseUrl: "https://extension.psu.edu",
    searchUrl: "https://extension.psu.edu/search?q=",
  },
  RI: {
    universityName: "University of Rhode Island",
    baseUrl: "https://web.uri.edu/coopext",
    searchUrl: "https://web.uri.edu/?s=",
  },
  SC: {
    universityName: "Clemson University",
    baseUrl: "https://www.clemson.edu/extension",
    searchUrl: "https://www.clemson.edu/extension/search?q=",
  },
  SD: {
    universityName: "South Dakota State University",
    baseUrl: "https://extension.sdstate.edu",
    searchUrl: "https://extension.sdstate.edu/search?q=",
  },
  TN: {
    universityName: "University of Tennessee",
    baseUrl: "https://extension.tennessee.edu",
    searchUrl: "https://extension.tennessee.edu/search?q=",
  },
  TX: {
    universityName: "Texas A&M AgriLife",
    baseUrl: "https://agrilifeextension.tamu.edu",
    searchUrl: "https://agrilifeextension.tamu.edu/search?q=",
  },
  UT: {
    universityName: "Utah State University",
    baseUrl: "https://extension.usu.edu",
    searchUrl: "https://extension.usu.edu/search?q=",
  },
  VT: {
    universityName: "University of Vermont",
    baseUrl: "https://www.uvm.edu/extension",
    searchUrl: "https://www.uvm.edu/search?q=",
  },
  VA: {
    universityName: "Virginia Cooperative Extension",
    baseUrl: "https://www.pubs.ext.vt.edu",
    searchUrl: "https://www.pubs.ext.vt.edu/search?q=",
  },
  WA: {
    universityName: "Washington State University",
    baseUrl: "https://extension.wsu.edu",
    searchUrl: "https://extension.wsu.edu/?s=",
  },
  WV: {
    universityName: "West Virginia University",
    baseUrl: "https://extension.wvu.edu",
    searchUrl: "https://extension.wvu.edu/?s=",
  },
  WI: {
    universityName: "University of Wisconsin",
    baseUrl: "https://extension.wisc.edu",
    searchUrl: "https://extension.wisc.edu/?s=",
  },
  WY: {
    universityName: "University of Wyoming",
    baseUrl: "https://www.uwyo.edu/uwext",
    searchUrl: "https://www.uwyo.edu/search?q=",
  },
};

// Known PDF URLs for common state+grassType combinations
export const knownPdfUrls: Record<string, string> = {
  "AR_bermudagrass": "https://uaex.uada.edu/publications/PDF/FSA-6121.pdf",
  "AR_zoysia": "https://www.uaex.uada.edu/publications/pdf/FSA-6122.pdf",
  "AR_tall-fescue": "https://uaex.uada.edu/yard-garden/lawns/default.aspx",
  "GA_tall-fescue":
    "https://turf.caes.uga.edu/content/dam/caes-subsite/georgiaturf/docs/pcrp2024/2024_Tall_Fescue_Calendar.pdf",
  "NC_bermudagrass":
    "https://content.ces.ncsu.edu/bermudagrass-lawn-maintenance-calendar",
  "NC_tall-fescue":
    "https://content.ces.ncsu.edu/tall-fescue-lawn-maintenance-calendar",
  "NC_centipede":
    "https://content.ces.ncsu.edu/centipede-lawn-maintenance-calendar",
  "NC_zoysia": "https://content.ces.ncsu.edu/zoysiagrass-lawn-maintenance-calendar",
  "GA_bermudagrass":
    "https://extension.uga.edu/publications/detail.html?number=C816",
  "TX_bermudagrass":
    "https://agrilifeextension.tamu.edu/library/gardening/lawn-care/",
  "FL_st-augustine":
    "https://edis.ifas.ufl.edu/publication/LH010",
  "FL_bermudagrass":
    "https://edis.ifas.ufl.edu/publication/LH008",
  "KY_kentucky-bluegrass":
    "https://extension.ca.uky.edu/files/agr-51.pdf",
  "MN_kentucky-bluegrass":
    "https://extension.umn.edu/lawn-care/lawn-care-guide",
  "PA_tall-fescue":
    "https://extension.psu.edu/tall-fescue",
};
