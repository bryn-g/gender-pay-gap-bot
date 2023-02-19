import { CompanyDataMultiYearItem } from "../types";
import { Company } from "../utils/Company";
import { getMostRecentMedianGPGOrThrow } from "../utils/getMostRecentGPG";
import { isNumber, modulus, roundNumber } from "../utils/isNumber";

export class CopyWriter {
  medianGpgForThisOrganisationPartialSentence(
    companyData: CompanyDataMultiYearItem
  ): string {
    const mostRecentGPG = getMostRecentMedianGPGOrThrow(companyData);
    const mostRecent = Number(mostRecentGPG.toFixed(1));
    const isPositiveGpg = mostRecent > 0.0;
    if (mostRecent === 0.0) {
      return `In this organisation, men's and women's median hourly pay is equal`;
    }
    if (isPositiveGpg) {
      return `In this organisation, women's median hourly pay is ${mostRecent}% lower than men's`;
    } else {
      return `In this organisation, women's median hourly pay is ${
        -1 * mostRecent
      }% higher than men's`;
    }
  }

  medianGpgForThisOrganisation(companyData: CompanyDataMultiYearItem): string {
    return `${this.medianGpgForThisOrganisationPartialSentence(companyData)}.`;
  }

  medianGpgWithDifferenceYearOnYearForThisOrganisation(
    companyData: CompanyDataMultiYearItem
  ): string {
    const company = new Company(companyData);
    if (company.hasTwoYearsConsecutive()) {
      const previousYears = company.getTwoYearsConsecutive();
      const year = previousYears!.year!;
      const previousYear = previousYears!.previousYear!;
      const differenceCopy = this.getDifferenceCopy(
        year.medianGpg,
        previousYear.medianGpg
      );
      const medianGpgCopy =
        this.medianGpgForThisOrganisationPartialSentence(companyData);
      return `${medianGpgCopy}. ${differenceCopy}`;
    }
    return this.medianGpgForThisOrganisation(companyData);
  }

  getDifferenceCopy(year: number, previousYear: number): string {
    const difference = year - previousYear;
    const yearRounded = roundNumber(year);
    const previousYearRounded = roundNumber(previousYear);

    const roundedDifference = roundNumber(difference);

    const changesDirection = yearRounded * previousYearRounded < 0;

    const gpgIncreased =
      (yearRounded > previousYearRounded &&
        yearRounded >= 0 &&
        previousYearRounded >= 0) ||
      (yearRounded < previousYearRounded &&
        yearRounded <= 0 &&
        previousYearRounded <= 0) ||
      (changesDirection && modulus(yearRounded) > modulus(previousYearRounded));

    const gpgNotChanged = year === previousYear;

    if (roundedDifference === 0.0 || gpgNotChanged) {
      return `The pay gap is the same as the previous year.`;
    }

    if (changesDirection) {
      if (previousYearRounded === 0) {
        return `In the previous year women's median hourly pay was equal to men's.`;
      }
      if (previousYearRounded > 0) {
        return `In the previous year men's median hourly pay was ${previousYearRounded} percentage point higher then women's.`;
      } else {
        return `In the previous year women's median hourly pay was ${
          -1 * previousYearRounded
        } percentage point higher then men's.`;
      }
    }

    const modulatedDifference = modulus(roundedDifference);

    if (gpgIncreased) {
      return `The pay gap is ${modulatedDifference} percentage points higher than the previous year.`;
    } else {
      return `The pay gap is ${modulatedDifference} percentage points lower than the previous year.`;
    }
  }
}
