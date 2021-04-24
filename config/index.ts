export const { AUTH_NAME, AUTH_PASSWORD } = process.env;
export const PAGES = {
  login: "https://tse.x2.international.travian.com/login.php",
  farmList:
    "https://tse.x2.international.travian.com/build.php?id=39&gid=16&tt=99",
};

export const SELECTORS = {
  auth: {
    inputs: {
      name: 'input[name="name"]',
      password: 'input[name="password"]',
    },
    button: "#s1",
  },
  popup: {
    parent: "#cmpbox",
    button: "#cmpbntyestxt",
  },
  rallyPoint: {
    raidList: ".raidList",
  },
};

export const MATCHING_PATTERNS = {
  farmsNaming: "running.farms",
  expandButton: "div[class='expandCollapse  collapsed']",
};

export const ACCEPTED_RAID_RESULTS = ["iReport1", "iReport2"];
