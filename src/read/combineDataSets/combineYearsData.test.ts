import { CompanyDataMultiYearItem, CompanySize } from "../../types";
import { combineYearsData } from "./combineYearsData";
import { mockImportedData } from "./testUtils";

describe("combineYearsData", () => {
  it("should combine data from lists of imported data into one companyItem", () => {
    const result = combineYearsData(mockImportedData, {
      companyName: "abc",
      companyNumber: "123",
    });
    const expectedResult: CompanyDataMultiYearItem = {
      companyName: "abc",
      companyNumber: "123",
      sicCodes: "456",
      size: CompanySize.From250To499,
      data2023To2024: {
        diffMedianBonusPercent: 1,
        femaleLowerMiddleQuartile: 2,
        femaleLowerQuartile: 3,
        femaleTopQuartile: 4,
        femaleUpperMiddleQuartile: 1,
        meanGpg: 7,
        medianGpg: 8,
      },
      data2017To2018: {
        meanGpg: 6,
        medianGpg: 7,
        femaleUpperMiddleQuartile: 1,
        diffMedianBonusPercent: 1,
        femaleLowerMiddleQuartile: 2,
        femaleLowerQuartile: 3,
        femaleTopQuartile: 4,
      },
      data2018To2019: {
        meanGpg: 5,
        medianGpg: 6,
        femaleUpperMiddleQuartile: 1,
        diffMedianBonusPercent: 1,
        femaleLowerMiddleQuartile: 2,
        femaleLowerQuartile: 3,
        femaleTopQuartile: 4,
      },
      data2019To2020: {
        meanGpg: 4,
        medianGpg: 5,
        femaleUpperMiddleQuartile: 1,
        diffMedianBonusPercent: 1,
        femaleLowerMiddleQuartile: 2,
        femaleLowerQuartile: 3,
        femaleTopQuartile: 4,
      },
      data2020To2021: {
        meanGpg: 3,
        medianGpg: 4,
        femaleUpperMiddleQuartile: 1,
        diffMedianBonusPercent: 1,
        femaleLowerMiddleQuartile: 2,
        femaleLowerQuartile: 3,
        femaleTopQuartile: 4,
      },
      data2021To2022: {
        meanGpg: 2,
        medianGpg: 3,
        femaleUpperMiddleQuartile: 1,
        diffMedianBonusPercent: 1,
        femaleLowerMiddleQuartile: 2,
        femaleLowerQuartile: 3,
        femaleTopQuartile: 4,
      },
      data2022To2023: {
        meanGpg: 1,
        medianGpg: 2,
        femaleUpperMiddleQuartile: 1,
        diffMedianBonusPercent: 1,
        femaleLowerMiddleQuartile: 2,
        femaleLowerQuartile: 3,
        femaleTopQuartile: 4,
      },
    };
    expect(result).toStrictEqual(expectedResult);
  });
});
