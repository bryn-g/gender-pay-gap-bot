import DataImporter from ".";
import { replaceSearchTerms } from "../twitter/replaceSearchTerms";
import {
  TwitterData,
  CompanyDataMultiYearItem,
  CompanyNumber,
  CompanyWithTwitterData,
} from "../types";
import { isDebugMode } from "../utils/debug";
import { findCompany, findCompanyWithIndex } from "../utils/findCompany";
import { isNumber } from "../utils/numberUtils";
import {
  getTextMatch,
  stringSplitByWords,
  toAcronym,
} from "../utils/textMatch";

interface potentialMatchResult {
  company: CompanyDataMultiYearItem;
  match: number;
}

export class Repository {
  dataImporter: DataImporter;
  twitterUserData!: TwitterData[];
  companiesGpgData!: CompanyDataMultiYearItem[];

  constructor(dataImporter: DataImporter) {
    this.dataImporter = dataImporter;
  }

  setData() {
    this.twitterUserData = this.dataImporter.twitterUserDataProd();
    this.companiesGpgData = this.dataImporter.companiesGpgData();
    if (isDebugMode()) {
      this.twitterUserData.push(this.dataImporter.twitterUserDataTest()[0]);
      this.companiesGpgData.push(this.dataImporter.companiesGpgDataTest()[0]);
    }
  }

  getTwitterUserByTwitterId(twitterId: string): TwitterData | null {
    this.checkSetData();
    for (let index = 0; index < this.twitterUserData.length; index++) {
      const c = this.twitterUserData[index];
      if (c.twitter_id_str === twitterId) {
        return c;
      }
    }
    return null;
  }

  getTwitterUserByTwitterHandle(twitterHandle: string): TwitterData | null {
    this.checkSetData();
    for (let index = 0; index < this.twitterUserData.length; index++) {
      const c = this.twitterUserData[index];
      if (c.twitter_screen_name === twitterHandle) {
        return c;
      }
    }
    return null;
  }

  getCompanyTwitterDataForCompany(
    companyName: string,
    companyNumber: string
  ): CompanyWithTwitterData | null {
    const companyData = this.getCompany(companyName, companyNumber);
    if (!companyData) {
      return null;
    }
    const twitterData = this.getTwitterUserByCompanyData(
      companyData.companyName,
      companyData.companyNumber
    );
    if (!twitterData) {
      return null;
    }
    return { companyData, twitterData };
  }

  getCompanyTwitterDataForTwitterId(
    twitterId: string
  ): CompanyWithTwitterData | null {
    const twitterData = this.getTwitterUserByTwitterId(twitterId);
    if (!twitterData) {
      return null;
    }
    const companyData = this.getCompany(
      twitterData.companyName,
      twitterData.companyNumber
    );
    if (!companyData) {
      return null;
    }
    return { companyData, twitterData };
  }

  getCompanyTwitterDataForTwitterHandle(
    twitterHandle: string
  ): CompanyWithTwitterData | null {
    const twitterData = this.getTwitterUserByTwitterHandle(twitterHandle);
    if (!twitterData) {
      return null;
    }
    const companyData = this.getCompany(
      twitterData.companyName,
      twitterData.companyNumber
    );
    if (!companyData) {
      return null;
    }
    return { companyData, twitterData };
  }

  getCompany(
    name: string,
    companyNumber: CompanyNumber
  ): CompanyDataMultiYearItem | null {
    this.checkSetData();
    const upperCaseName = name?.toUpperCase();
    return findCompany(upperCaseName, companyNumber, this.companiesGpgData);
  }

  getTwitterUserByCompanyData(
    name: string,
    companyNumber: CompanyNumber
  ): TwitterData | null {
    this.checkSetData();
    const upperCaseName = name?.toUpperCase();
    return findCompany(upperCaseName, companyNumber, this.twitterUserData);
  }

  getNextCompanyWithData(
    name: string,
    companyNumber: CompanyNumber
  ): CompanyDataMultiYearItem | null {
    this.checkSetData();
    const current = findCompanyWithIndex(
      name,
      companyNumber,
      this.companiesGpgData
    );
    if (!current) {
      throw new Error(
        `could not find current company for name: ${name}, number:${companyNumber}`
      );
    }
    let nextIndex = current.index + 1;
    while (true) {
      if (nextIndex > this.companiesGpgData.length) {
        return null;
      }

      const nextCompany = this.companiesGpgData[nextIndex];

      const has2021Data =
        nextCompany.data2021To2022 &&
        nextCompany.data2020To2021 &&
        isNumber(nextCompany.data2021To2022.medianGpg) &&
        isNumber(nextCompany.data2020To2021.medianGpg);

      const has2022Data =
        nextCompany.data2022To2023 &&
        nextCompany.data2021To2022 &&
        isNumber(nextCompany.data2022To2023.medianGpg) &&
        isNumber(nextCompany.data2021To2022.medianGpg);

      // TODO year specific logic here.
      // TODO can use company class here.
      if (nextCompany && (has2022Data || has2021Data)) {
        return nextCompany;
      }
      nextIndex++;
    }
  }

  getNextMatchingCompanyWithData(
    name: string,
    companyNumber: CompanyNumber,
    matchingFunction: (CompanyDataItem: CompanyDataMultiYearItem) => boolean
  ): CompanyDataMultiYearItem | null {
    this.checkSetData();
    const current = findCompanyWithIndex(
      name,
      companyNumber,
      this.companiesGpgData
    );
    if (!current) {
      throw new Error(
        `could not find current company for name: ${name}, number:${companyNumber}`
      );
    }
    let nextIndex = current.index + 1;
    while (true) {
      if (nextIndex > this.companiesGpgData.length) {
        return null;
      }
      const nextCompany = this.companiesGpgData[nextIndex];
      if (!nextCompany) {
        nextIndex++;
        continue;
      }
      if (matchingFunction(nextCompany)) {
        return nextCompany;
      } else {
        nextIndex++;
        continue;
      }
    }
  }

  fuzzyFindCompanyByName(companyName: string): FuzzyFindCompanyByNameResult {
    this.checkSetData();
    const upperCaseName = companyName?.toUpperCase();
    const exactMatchOnName = findCompany(
      upperCaseName,
      "UNKNOWN_COMPANY_NUMBER",
      this.companiesGpgData
    );
    if (exactMatchOnName) {
      return { exactMatch: exactMatchOnName, closeMatches: [] };
    }

    const potentialMatches = this.findPotentialMatchesByName(companyName, 0.85);
    if (potentialMatches.length) {
      return { closeMatches: potentialMatches, exactMatch: null };
    }
    const potentialMatches75 = this.findPotentialMatchesByName(
      companyName,
      0.75
    );

    if (potentialMatches75.length) {
      return { closeMatches: potentialMatches75, exactMatch: null };
    }

    const potentialMatchesWithReplace = this.findPotentialMatchesByName(
      companyName,
      0.75,
      replaceSearchTerms
    );

    if (potentialMatchesWithReplace.length) {
      return { closeMatches: potentialMatchesWithReplace, exactMatch: null };
    }

    // attempt order by
    const orderedPotentialMatches = this.findPotentialMatchesOrderByMatch(
      companyName,
      replaceSearchTerms
    );

    return {
      closeMatches: orderedPotentialMatches.map((c) => c.company),
      exactMatch: null,
    };
  }

  private findPotentialMatchesOrderByMatch(
    companyName: string,
    replaceTerms: (s: string) => string
  ): potentialMatchResult[] {
    const searchName = replaceTerms(companyName);

    const potentialMatches: potentialMatchResult[] = [];
    for (let index = 0; index < this.companiesGpgData.length; index++) {
      const company = this.companiesGpgData[index];
      const match = getTextMatch(searchName, replaceTerms(company.companyName));
      if (match > 0) {
        potentialMatches.push({ company, match });
      }
    }
    return potentialMatches.sort(sortByMatchDesc());
  }

  private findPotentialMatchesByName(
    companyName: string,
    minimumMatchFactor: number,
    replaceTerms?: (s: string) => string
  ): CompanyDataMultiYearItem[] {
    const searchName = replaceTerms ? replaceTerms(companyName) : companyName;
    const potentialMatches: potentialMatchResult[] = [];
    for (let index = 0; index < this.companiesGpgData.length; index++) {
      const company = this.companiesGpgData[index];

      const dataCompanyName = replaceTerms
        ? replaceTerms(company.companyName)
        : company.companyName;

      if (stringSplitByWords(searchName).length === 1) {
        const companyAcronym = toAcronym(dataCompanyName);
        if (companyAcronym === searchName) {
          potentialMatches.push({ company, match: 0.9 });
        }
      }
      const match = getTextMatch(searchName, dataCompanyName);
      if (match >= minimumMatchFactor) {
        potentialMatches.push({ company, match });
      }
    }
    return potentialMatches.sort(sortByMatchDesc()).map((c) => c.company);
  }

  checkSetData() {
    if (!this.twitterUserData || !this.companiesGpgData) {
      this.setData();
    }
  }
}

interface FuzzyFindCompanyByNameResult {
  exactMatch: CompanyDataMultiYearItem | null;
  closeMatches: CompanyDataMultiYearItem[];
}

function sortByMatchDesc():
  | ((a: potentialMatchResult, b: potentialMatchResult) => number)
  | undefined {
  return (a, b) => {
    if (a.match > b.match) {
      return -1;
    }
    if (a.match < b.match) {
      return 1;
    }
    return 0;
  };
}
