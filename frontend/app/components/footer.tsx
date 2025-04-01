import { useTranslation } from 'react-i18next';

import { cn } from '~/utils/tailwind-utils';

export function Footer() {
  const { t } = useTranslation(['common']);

  return (
    <footer id="footer" className="bg-[#26374A]">
      <section>
        <h2 className="sr-only" id="accessibleSectionHeader1">
          {t('common:footer.header-accessible')}
        </h2>
        <h3 className="container pt-[24px] pb-2 text-[19px] leading-[21px] font-bold text-white">{t('footer.header')}</h3>
        <div className="bg-[url('/footer_bg_img.svg')] bg-clip-border bg-bottom bg-no-repeat sm:bg-right-bottom">
          <nav role="navigation" aria-labelledby="accessibleSectionHeader1">
            <ul className="container flex flex-col pb-[22px] sm:grid sm:grid-cols-3">
              {FooterItem(
                t('common:footer.all-contacts.text'),
                t('common:footer.all-contacts.href'),
                'footerLine mb-3 relative pb-[26px]',
              )}

              {FooterItem(t('common:footer.department-and-agencies.text'), t('common:footer.department-and-agencies.href'))}
              {FooterItem(t('common:footer.about-government.text'), t('common:footer.about-government.href'))}
              {FooterItem(t('common:footer.jobs.text'), t('common:footer.jobs.href'))}
              {FooterItem(t('common:footer.taxes.text'), t('common:footer.taxes.href'))}
              {FooterItem(t('common:footer.canada-and-world.text'), t('common:footer.canada-and-world.href'))}
              {FooterItem(
                t('common:footer.immigration-and-citizenship.text'),
                t('common:footer.immigration-and-citizenship.href'),
              )}
              {FooterItem(
                t('common:footer.environment-and-natural-resources.text'),
                t('common:footer.environment-and-natural-resources.href'),
              )}
              {FooterItem(t('common:footer.money-and-finance.text'), t('common:footer.money-and-finance.href'))}
              {FooterItem(t('common:footer.travel-and-tourism.text'), t('common:footer.travel-and-tourism.href'))}
              {FooterItem(
                t('common:footer.national-security-and-defence.text'),
                t('common:footer.national-security-and-defence.href'),
              )}
              {FooterItem(t('common:footer.science-and-innovation.text'), t('common:footer.science-and-innovation.href'))}
              {FooterItem(t('common:footer.business.text'), t('common:footer.business.href'))}
              {FooterItem(
                t('common:footer.culture-history-and-sports.text'),
                t('common:footer.culture-history-and-sports.href'),
              )}
              {FooterItem(t('common:footer.indigenous-peoples.text'), t('common:footer.indigenous-peoples.href'))}
              {FooterItem(t('common:footer.benefits.text'), t('common:footer.benefits.href'))}
              {FooterItem(
                t('common:footer.policing-justice-and-emergencies.text'),
                t('common:footer.policing-justice-and-emergencies.href'),
              )}
              {FooterItem(t('common:footer.veterans-and-military.text'), t('common:footer.veterans-and-military.href'))}
              {FooterItem(t('common:footer.health.text'), t('common:footer.health.href'))}
              {FooterItem(
                t('common:footer.transport-and-infrastructure.text'),
                t('common:footer.transport-and-infrastructure.href'),
              )}
              {FooterItem(t('common:footer.youth.text'), t('common:footer.youth.href'))}
            </ul>
          </nav>
        </div>
      </section>
      <section className="bg-[#F8F8F8]">
        <div className="container flex min-h-[96px] justify-between">
          <div className="flex flex-row items-center">
            <nav role="navigation" aria-labelledby="accessibleSectionHeader2">
              <h2 className="sr-only" id="accessibleSectionHeader2">
                {t('common:footer.about-site')}
              </h2>
              <ul className="flex flex-col py-4 whitespace-nowrap md:flex-row">
                {SubFooterItem(t('common:footer.social-media.text'), t('common:footer.social-media.href'), 'first')}
                {SubFooterItem(t('common:footer.mobile-applications.text'), t('common:footer.mobile-applications.href'))}
                {SubFooterItem(t('common:footer.about-canada-ca.text'), t('common:footer.about-canada-ca.href'))}
                {SubFooterItem(t('common:footer.terms-and-conditions.text'), t('common:footer.terms-and-conditions.href'))}
                {SubFooterItem(t('common:footer.privacy.text'), t('common:footer.privacy.href'))}
              </ul>
            </nav>
          </div>
          <div className="mr-[5px] flex min-h-[96px] shrink-0 items-end md:items-center">
            <img
              className="my-[15px] h-[25px] w-[105px] md:h-[40px] md:w-[164px]"
              src="/wmms-blk.svg"
              alt={t('common:footer.gc-symbol')}
            />
          </div>
        </div>
      </section>
    </footer>
  );
}

function FooterItem(text: string, href: string, className: string | undefined = undefined) {
  return (
    <li className={cn('my-1 w-64 list-none sm:w-56 lg:w-80', className)}>
      <a className="text-[14px] leading-[19px] font-[400] !text-white" href={href}>
        {text}
      </a>
    </li>
  );
}

function SubFooterItem(text: string, href: string, type: 'first' | 'subsequent' = 'subsequent') {
  return (
    <li className={cn('my-1 pr-4', type !== 'first' ? "md:before:mr-3 md:before:content-['•']" : undefined)}>
      <a className="text-[14px] leading-[19px] font-[400] text-[#284162]" href={href}>
        {text}
      </a>
    </li>
  );
}
