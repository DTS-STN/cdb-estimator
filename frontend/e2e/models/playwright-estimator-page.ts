import { PlaywrightBasePage } from './playwright-base-page';

export class PlaywrightEstimatorPage extends PlaywrightBasePage {
  async isLoaded(
    estimatorPage: 'index' | 'marital-status' | 'income' | 'results',
    language: Language = 'en',
    heading?: string | RegExp,
  ) {
    let pageInfo: { url: string | RegExp; heading: string | RegExp } | undefined;

    switch (estimatorPage) {
      case 'index': {
        pageInfo =
          language === 'fr'
            ? { url: /\/fr/, heading: 'Estimateur de la Prestation canadienne pour les personnes handicapées' }
            : { url: /\/en/, heading: 'Canada Disability Benefit Estimator' };
        break;
      }

      case 'marital-status': {
        pageInfo =
          language === 'fr'
            ? { url: /\/fr\/etat-civil/, heading: 'Étape 1 de 2 : État matrimonial' }
            : { url: /\/en\/marital-status/, heading: 'Step 1 of 2: Marital Status' };
        break;
      }

      case 'income': {
        pageInfo =
          language === 'fr'
            ? { url: /\/fr\/revenus/, heading: 'Étape 2 de 2 : Revenu' }
            : { url: /\/en\/income/, heading: 'Step 2 of 2: Income' };
        break;
      }

      case 'results': {
        pageInfo =
          language === 'fr' //
            ? { url: /\/fr\/resultats/, heading: 'Résultats' }
            : { url: /\/en\/results/, heading: 'Results' };
        break;
      }

      default: {
        pageInfo = undefined;
        break;
      }
    }

    if (!pageInfo) throw new Error(`estimatorPage '${estimatorPage}' not implemented.`);
    await super.isLoaded(pageInfo.url, language, heading ?? pageInfo.heading);
  }
}
