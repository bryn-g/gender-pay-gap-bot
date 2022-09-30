import { writeJsonFile } from "../utils/write.js";
import { parseDataFromJson } from "./parseDataFromCompany";
import DataImporter from "../importData";
import { findCompany } from "../utils/findCompany";
import {
  CompanyDataMultiYearItem,
  CompanyDataSingleYearItem,
  CompanySize,
} from "../types.js";
const dataImporter = new DataImporter();

const json2022 = dataImporter.gpg_2021_2022();
const json2021 = dataImporter.gpg_2020_2021();
const json2020 = dataImporter.gpg_2019_2020();
const json2019 = dataImporter.gpg_2018_2019();
const json2018 = dataImporter.gpg_2017_2018();

getAllData().then(() => console.log("Finished!!!"));

async function getAllData() {
  console.log("Started reading data from 2021_2022");
  const data_2021_2022 = await parseDataFromJson(json2022);
  console.log("Finished reading data from 2021_2022");

  console.log("Started reading data from 2020_2021");
  const data_2020_2021 = await parseDataFromJson(json2021);
  console.log("Finished reading data from 2020_2021");

  console.log("Started reading data from 2019_2020");
  const data_2019_2020 = await parseDataFromJson(json2020);
  console.log("Finished reading data from 2019_2020");

  console.log("Started reading data from 2018_2019");
  const data_2018_2019 = await parseDataFromJson(json2019);
  console.log("Finished reading data from 2018_2019");

  console.log("Started reading data from 2017_2018");
  const data_2017_2018 = await parseDataFromJson(json2018);
  console.log("Finished reading data from 2017_2018");

  const numberOfItems2022 = data_2021_2022.length;
  const numberOfItems2021 = data_2020_2021.length;
  const numberOfItems2020 = data_2019_2020.length;
  const numberOfItems2019 = data_2018_2019.length;
  const numberOfItems2018 = data_2017_2018.length;

  const totalData =
    numberOfItems2022 +
    numberOfItems2021 +
    numberOfItems2020 +
    numberOfItems2019 +
    numberOfItems2018;

  console.log("Total Data:", totalData);
  console.log("Number of items:", {
    numberOfItems2022,
    numberOfItems2021,
    numberOfItems2020,
    numberOfItems2019,
    numberOfItems2018,
    totalData,
  });

  if (process.argv[2] === "debug") {
    return;
  }

  // 2022 data
  const combinedData = [];
  let complete = 0;
  printPercentageComplete(complete, totalData);
  for (let index = 0; index < data_2021_2022.length; index++) {
    const company = data_2021_2022[index];
    const item_2021 = findCompany(
      company.companyName,
      company.companyNumber,
      data_2020_2021
    );
    const item_2020 = findCompany(
      company.companyName,
      company.companyNumber,
      data_2019_2020
    );
    const item_2019 = findCompany(
      company.companyName,
      company.companyNumber,
      data_2018_2019
    );
    const item_2018 = findCompany(
      company.companyName,
      company.companyNumber,
      data_2017_2018
    );

    combinedData.push(
      toCompanyGpgDataItem(company, item_2021, item_2020, item_2019, item_2018)
    );
  }

  complete += numberOfItems2022;

  // 2021 data
  printPercentageComplete(complete, totalData);
  for (let index = 0; index < data_2020_2021.length; index++) {
    const company = data_2020_2021[index];
    const isInCombinedData = findCompany(
      company.companyName,
      company.companyNumber,
      combinedData
    );
    if (isInCombinedData) {
      continue;
    }
    const item_2020 = findCompany(
      company.companyName,
      company.companyNumber,
      data_2019_2020
    );
    const item_2019 = findCompany(
      company.companyName,
      company.companyNumber,
      data_2018_2019
    );
    const item_2018 = findCompany(
      company.companyName,
      company.companyNumber,
      data_2017_2018
    );

    combinedData.push(
      toCompanyGpgDataItem(null, company, item_2020, item_2019, item_2018)
    );
  }

  complete += numberOfItems2021;
  // 2020 data
  printPercentageComplete(complete, totalData);
  for (let index = 0; index < data_2019_2020.length; index++) {
    const company = data_2019_2020[index];
    const isInCombinedData = findCompany(
      company.companyName,
      company.companyNumber,
      combinedData
    );
    if (isInCombinedData) {
      continue;
    }
    const item_2019 = findCompany(
      company.companyName,
      company.companyNumber,
      data_2018_2019
    );
    const item_2018 = findCompany(
      company.companyName,
      company.companyNumber,
      data_2017_2018
    );

    combinedData.push(
      toCompanyGpgDataItem(null, null, company, item_2019, item_2018)
    );
  }

  complete += numberOfItems2020;

  // 2019 data
  printPercentageComplete(complete, totalData);
  for (let index = 0; index < data_2018_2019.length; index++) {
    const company = data_2018_2019[index];
    const isInCombinedData = findCompany(
      company.companyName,
      company.companyNumber,
      combinedData
    );
    if (isInCombinedData) {
      continue;
    }
    const item_2018 = findCompany(
      company.companyName,
      company.companyNumber,
      data_2017_2018
    );

    combinedData.push(
      toCompanyGpgDataItem(null, null, null, company, item_2018)
    );
  }

  complete += numberOfItems2019;
  // 2018 data
  printPercentageComplete(complete, totalData);
  for (let index = 0; index < data_2017_2018.length; index++) {
    const company = data_2017_2018[index];
    const isInCombinedData = findCompany(
      company.companyName,
      company.companyNumber,
      combinedData
    );
    if (isInCombinedData) {
      continue;
    }

    combinedData.push(toCompanyGpgDataItem(null, null, null, null, company));
  }

  await writeJsonFile("./data/companies_GPG_Data.json", combinedData);
  console.log("Wrote file!");
}

export interface Company {
  companyName: string;
  companyNumber: string;
  size: string;
  genderPayGap: number;
  medianGenderPayGap: number;
  sicCodes: string;
}

function toCompanyGpgDataItem(
  item_2022: Company | null,
  item_2021: Company | null,
  item_2020: Company | null,
  item_2019: Company | null,
  item_2018: Company | null
): CompanyDataMultiYearItem {
  const latestCompanyObject = getLatestCompanyEntry(
    item_2022,
    item_2021,
    item_2020,
    item_2019,
    item_2018
  );
  return {
    companyName: latestCompanyObject.companyName,
    companyNumber: latestCompanyObject.companyNumber,
    size: latestCompanyObject.size as CompanySize, // TODO parse this better!
    sicCodes: latestCompanyObject.sicCodes,

    data2021To2022: toCompanyDataSingleYearItem(item_2022),
    data2020To2021: toCompanyDataSingleYearItem(item_2021),
    data2019To2020: toCompanyDataSingleYearItem(item_2020),
    data2018To2019: toCompanyDataSingleYearItem(item_2019),
    data2017To2018: toCompanyDataSingleYearItem(item_2018),
  };
}

function toCompanyDataSingleYearItem(
  company: Company
): CompanyDataSingleYearItem | null {
  if (!company.genderPayGap && !company.medianGenderPayGap) {
    return null;
  }
  if (company.genderPayGap && company.medianGenderPayGap) {
    return {
      meanGpg: company.genderPayGap,
      medianGpg: company.medianGenderPayGap,
    };
  }
  throw new Error(`wrong fields present: ${JSON.stringify(company)}`);
}

function getLatestCompanyEntry(
  item_2022: Company | null,
  item_2021: Company | null,
  item_2020: Company | null,
  item_2019: Company | null,
  item_2018: Company | null
): Company {
  const yearsOfCompany = [
    item_2022,
    item_2021,
    item_2020,
    item_2019,
    item_2018,
  ];

  for (let index = 0; index < yearsOfCompany.length; index++) {
    const element = yearsOfCompany[index];
    if (isValidCompany(element)) {
      return element;
    }
  }
  throw new Error(
    `there are no valid items for: ${JSON.stringify(yearsOfCompany)}`
  );
}

function isValidCompany(c: Company) {
  return !!c && !!c.companyName;
}

function printPercentageComplete(current: number, totalData: number) {
  const complete = percentageComplete(current, totalData);
  console.log("Progress:", complete, "%");
}

function percentageComplete(current: number, totalData: number) {
  return (current / totalData) * 100;
}
