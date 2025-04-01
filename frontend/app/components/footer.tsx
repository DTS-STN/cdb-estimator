import { useTranslation } from 'react-i18next';

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
              <li className="footerLine relative my-1 mb-3 w-64 list-none pb-[26px] sm:w-56 lg:w-80">
                <a className="text-[14px] leading-[19px] font-[400] !text-white" href={'common:footer.all-contacts.href'}>
                  {t('common:footer.all-contacts.text')}
                </a>
              </li>
              <li className="my-1 w-64 list-none sm:w-56 lg:w-80">
                <a
                  className="text-[14px] leading-[19px] font-[400] !text-white"
                  href={t('common:footer.department-and-agencies.href')}
                >
                  {t('common:footer.department-and-agencies.text')}
                </a>
              </li>
              <li className="my-1 w-64 list-none sm:w-56 lg:w-80">
                <a
                  className="text-[14px] leading-[19px] font-[400] !text-white"
                  href={t('common:footer.about-government.href')}
                >
                  {t('common:footer.about-government.text')}
                </a>
              </li>
              <li className="my-1 w-64 list-none sm:w-56 lg:w-80">
                <a className="text-[14px] leading-[19px] font-[400] !text-white" href={t('common:footer.jobs.href')}>
                  {t('common:footer.jobs.text')}
                </a>
              </li>
              <li className="my-1 w-64 list-none sm:w-56 lg:w-80">
                <a className="text-[14px] leading-[19px] font-[400] !text-white" href={t('common:footer.taxes.href')}>
                  {t('common:footer.taxes.text')}
                </a>
              </li>
              <li className="my-1 w-64 list-none sm:w-56 lg:w-80">
                <a
                  className="text-[14px] leading-[19px] font-[400] !text-white"
                  href={t('common:footer.canada-and-world.href')}
                >
                  {t('common:footer.canada-and-world.text')}
                </a>
              </li>
              <li className="my-1 w-64 list-none sm:w-56 lg:w-80">
                <a
                  className="text-[14px] leading-[19px] font-[400] !text-white"
                  href={t('common:footer.immigration-and-citizenship.href')}
                >
                  {t('common:footer.immigration-and-citizenship.text')}
                </a>
              </li>
              <li className="my-1 w-64 list-none sm:w-56 lg:w-80">
                <a
                  className="text-[14px] leading-[19px] font-[400] !text-white"
                  href={t('common:footer.environment-and-natural-resources.href')}
                >
                  {t('common:footer.environment-and-natural-resources.text')}
                </a>
              </li>
              <li className="my-1 w-64 list-none sm:w-56 lg:w-80">
                <a
                  className="text-[14px] leading-[19px] font-[400] !text-white"
                  href={t('common:footer.money-and-finance.href')}
                >
                  {t('common:footer.money-and-finance.text')}
                </a>
              </li>
              <li className="my-1 w-64 list-none sm:w-56 lg:w-80">
                <a
                  className="text-[14px] leading-[19px] font-[400] !text-white"
                  href={t('common:footer.travel-and-tourism.href')}
                >
                  {t('common:footer.travel-and-tourism.text')}
                </a>
              </li>
              <li className="my-1 w-64 list-none sm:w-56 lg:w-80">
                <a
                  className="text-[14px] leading-[19px] font-[400] !text-white"
                  href={t('common:footer.national-security-and-defence.href')}
                >
                  {t('common:footer.national-security-and-defence.text')}
                </a>
              </li>
              <li className="my-1 w-64 list-none sm:w-56 lg:w-80">
                <a
                  className="text-[14px] leading-[19px] font-[400] !text-white"
                  href={t('common:footer.science-and-innovation.href')}
                >
                  {t('common:footer.science-and-innovation.text')}
                </a>
              </li>
              <li className="my-1 w-64 list-none sm:w-56 lg:w-80">
                <a className="text-[14px] leading-[19px] font-[400] !text-white" href={t('common:footer.business.href')}>
                  {t('common:footer.business.text')}
                </a>
              </li>
              <li className="my-1 w-64 list-none sm:w-56 lg:w-80">
                <a
                  className="text-[14px] leading-[19px] font-[400] !text-white"
                  href={t('common:footer.culture-history-and-sports.href')}
                >
                  {t('common:footer.culture-history-and-sports.text')}
                </a>
              </li>
              <li className="my-1 w-64 list-none sm:w-56 lg:w-80">
                <a
                  className="text-[14px] leading-[19px] font-[400] !text-white"
                  href={t('common:footer.indigenous-peoples.href')}
                >
                  {t('common:footer.indigenous-peoples.text')}
                </a>
              </li>
              <li className="my-1 w-64 list-none sm:w-56 lg:w-80">
                <a className="text-[14px] leading-[19px] font-[400] !text-white" href={t('common:footer.benefits.href')}>
                  {t('common:footer.benefits.text')}
                </a>
              </li>
              <li className="my-1 w-64 list-none sm:w-56 lg:w-80">
                <a
                  className="text-[14px] leading-[19px] font-[400] !text-white"
                  href={t('common:footer.policing-justice-and-emergencies.href')}
                >
                  {t('common:footer.policing-justice-and-emergencies.text')}
                </a>
              </li>
              <li className="my-1 w-64 list-none sm:w-56 lg:w-80">
                <a
                  className="text-[14px] leading-[19px] font-[400] !text-white"
                  href={t('common:footer.veterans-and-military.href')}
                >
                  {t('common:footer.veterans-and-military.text')}
                </a>
              </li>
              <li className="my-1 w-64 list-none sm:w-56 lg:w-80">
                <a className="text-[14px] leading-[19px] font-[400] !text-white" href={t('common:footer.health.href')}>
                  {t('common:footer.health.text')}
                </a>
              </li>
              <li className="my-1 w-64 list-none sm:w-56 lg:w-80">
                <a
                  className="text-[14px] leading-[19px] font-[400] !text-white"
                  href={t('common:footer.transport-and-infrastructure.href')}
                >
                  {t('common:footer.transport-and-infrastructure.text')}
                </a>
              </li>
              <li className="my-1 w-64 list-none sm:w-56 lg:w-80">
                <a className="text-[14px] leading-[19px] font-[400] !text-white" href={t('common:footer.youth.href')}>
                  {t('common:footer.youth.text')}
                </a>
              </li>
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
              <ul className="flex list-disc flex-col py-4 whitespace-nowrap md:flex-row">
                <li className="my-1 pr-4">
                  <a
                    className="text-[14px] leading-[19px] font-[400] text-[#284162]"
                    href={t('common:footer.social-media.href')}
                  >
                    {t('common:footer.social-media.text')}
                  </a>
                </li>
                <li className="md:custom-bullet my-1 pr-4">
                  <a
                    className="text-[14px] leading-[19px] font-[400] text-[#284162]"
                    href={t('common:footer.mobile-applications.href')}
                  >
                    {t('common:footer.mobile-applications.text')}
                  </a>
                </li>
                <li className="md:custom-bullet my-1 pr-4">
                  <a
                    className="text-[14px] leading-[19px] font-[400] text-[#284162]"
                    href={t('common:footer.about-canada-ca.href')}
                  >
                    {t('common:footer.about-canada-ca.text')}
                  </a>
                </li>
                <li className="md:custom-bullet my-1 pr-4">
                  <a
                    className="text-[14px] leading-[19px] font-[400] text-[#284162]"
                    href={t('common:footer.terms-and-conditions.href')}
                  >
                    {t('common:footer.terms-and-conditions.text')}
                  </a>
                </li>
                <li className="md:custom-bullet my-1 pr-4">
                  <a className="text-[14px] leading-[19px] font-[400] text-[#284162]" href={t('common:footer.privacy.href')}>
                    {t('common:footer.privacy.text')}
                  </a>
                </li>
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
