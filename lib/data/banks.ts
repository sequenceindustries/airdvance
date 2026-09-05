/**
 * Major South African banks and their universal branch codes. Most SA banks
 * moved to a single "universal branch code" years ago, so this covers the
 * vast majority of real-world accounts. The branch code field stays editable
 * in case a customer has an older, non-universal branch code.
 */
export const SOUTH_AFRICAN_BANKS: { name: string; branchCode: string }[] = [
  { name: "ABSA Bank", branchCode: "632005" },
  { name: "African Bank", branchCode: "430000" },
  { name: "Bank Zero", branchCode: "888000" },
  { name: "Bidvest Bank", branchCode: "462005" },
  { name: "Capitec Bank", branchCode: "470010" },
  { name: "Discovery Bank", branchCode: "679000" },
  { name: "First National Bank (FNB)", branchCode: "250655" },
  { name: "Investec Bank", branchCode: "580105" },
  { name: "Mercantile Bank", branchCode: "450905" },
  { name: "Nedbank", branchCode: "198765" },
  { name: "Sasfin Bank", branchCode: "683000" },
  { name: "Standard Bank", branchCode: "051001" },
  { name: "TymeBank", branchCode: "678910" },
];
