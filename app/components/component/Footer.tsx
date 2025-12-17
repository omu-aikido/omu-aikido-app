import { Link } from "react-router"
import { tv } from "tailwind-variants"

import { Icon } from "~/components/ui/Icon"
import { style } from "~/styles/component"

const footer = {
  link: tv({
    base: "mx-2 text-cyan-600 visited:text-emerald-600 hover:text-blue-600 dark:text-blue-300 dark:visited:text-emerald-300 dark:hover:text-cyan-400",
  }),
  social: {
    link: tv({
      base: "mx-2 my-0 flex items-center px-2 text-slate-700 transition-transform hover:scale-110 hover:transform dark:text-slate-300",
    }),
    text: tv({
      base: "mr-2 hidden text-sm font-bold text-slate-700 md:block dark:text-slate-300",
    }),
  },
}

export function Footer() {
  return (
    <footer
      className="flex flex-col items-center justify-center bg-slate-300 p-4 dark:bg-slate-800"
      data-testid="footer-container"
    >
      <div className="items-center p-4 text-center" data-testid="footer-info">
        <p className={style.text.info({ class: "text-center" })}>
          © OMU Aikido Club All Rights Reserved.
          <br />
          〒599-8531 大阪府堺市中区学園町1番1号 大阪公立大学合氣道部
        </p>
      </div>

      <div data-testid="footer-links">
        <Link
          to="https://omu-aikido.com/privacy-policy"
          className={footer.link()}
          data-testid="footer-link-privacy"
        >
          プライバシーポリシー
        </Link>
        <Link
          to="https://omu-aikido.com/terms-of-service"
          className={footer.link()}
          data-testid="footer-link-terms"
        >
          利用規約
        </Link>
      </div>

      <div
        className="flex flex-row items-center justify-center p-4"
        data-testid="footer-social"
      >
        <a
          href="https://twitter.com/fudaiaiki"
          aria-label="旧府大合氣道部 Twitter"
          className={footer.social.link()}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="footer-social-fudai-twitter"
        >
          <Icon icon="twitter-logo" />
          <span className={footer.social.text()}>旧府大Twitter</span>
        </a>
        <a
          href="https://twitter.com/new_ocuaikido"
          aria-label="旧市大合気道サークル Twitter"
          className={footer.social.link()}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="footer-social-ocu-twitter"
        >
          <Icon icon="twitter-logo" />
          <span className={footer.social.text()}>旧市大Twitter</span>
        </a>
        <a
          href="https://instagram.com/hamudaiaikidoubu"
          aria-label="Instagram"
          className={footer.social.link()}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="footer-social-instagram"
        >
          <Icon icon="instagram-logo" />
          <span className={footer.social.text()}>Instagram</span>
        </a>
        <a
          href="https://github.com/omu-aikido"
          aria-label="GitHub"
          className={footer.social.link()}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="footer-social-github"
        >
          <Icon icon="github-logo" />
          <span className={footer.social.text()}>GitHub</span>
        </a>
      </div>
    </footer>
  )
}
