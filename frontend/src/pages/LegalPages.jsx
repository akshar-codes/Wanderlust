import { useState } from "react";
import {
  Box,
  Button,
  FormControlLabel,
  Switch,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";

const UPDATED = "25 September 2026";

function LegalSection({ title, children }) {
  return (
    <section>
      <Typography component="h2" variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
        {title}
      </Typography>
      <Typography
        component="div"
        sx={{ color: "var(--color-text-secondary)", lineHeight: 1.8 }}
      >
        {children}
      </Typography>
    </section>
  );
}

export function PrivacyPage() {
  return (
    <Box className="legal-page">
      <PageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        subtitle="How Wanderlust handles information when you use the platform."
      />
      <Typography className="legal-page__date">
        Last updated: {UPDATED}
      </Typography>
      <LegalSection title="Information you provide">
        When you create an account or use Wanderlust, you may provide contact
        and profile details, listing information, booking details, messages,
        reviews, photos, and account preferences. Please avoid putting sensitive
        personal information in public profile fields, listing descriptions, or
        reviews.
      </LegalSection>
      <LegalSection title="Information created through use">
        Wanderlust processes information needed to operate accounts, listings,
        wishlists, bookings, reviews, notifications, and host dashboards. The
        service also receives basic technical information with requests, such as
        the information required to keep a session secure and prevent abuse.
      </LegalSection>
      <LegalSection title="How we use information">
        We use information to provide and maintain the marketplace, connect
        guests and hosts, manage account security, respond to support requests,
        send service messages, and improve the reliability of the product. We do
        not use your account preferences as a substitute for a separate
        marketing consent.
      </LegalSection>
      <LegalSection title="Sharing">
        Information is shown to other users when needed for marketplace
        features. For example, listing details are public, and booking
        participants need relevant booking and profile details to coordinate a
        stay. Service providers may process information to support hosting, file
        storage, email, or the database. We do not sell personal information.
      </LegalSection>
      <LegalSection title="Retention and security">
        We keep information for as long as needed to provide the service, meet
        operational needs, resolve disputes, and comply with applicable
        requirements. We use access controls and security measures, but no
        online service can guarantee absolute security.
      </LegalSection>
      <LegalSection title="Your choices">
        You can review and update some profile and preference information in
        account settings. You can also request help with your account through
        the <Link to="/help">Help Center</Link>. Some records may need to be
        retained where required for legitimate operational or legal reasons.
      </LegalSection>
      <LegalSection title="Cookies and similar storage">
        Wanderlust uses browser storage and cookies required for sign-in,
        session continuity, and request security. See{" "}
        <Link to="/cookies">Cookie Settings</Link> for details about the
        controls available in this app.
      </LegalSection>
      <LegalSection title="Changes and contact">
        We may revise this policy as the service changes. The updated date above
        identifies the latest revision. For privacy questions, contact us
        through the <Link to="/help">Help Center</Link>.
      </LegalSection>
    </Box>
  );
}

export function TermsPage() {
  return (
    <Box className="legal-page">
      <PageHeader
        eyebrow="Legal"
        title="Terms of Service"
        subtitle="The basic rules for using the Wanderlust marketplace."
      />
      <Typography className="legal-page__date">
        Last updated: {UPDATED}
      </Typography>
      <LegalSection title="Using Wanderlust">
        Wanderlust provides tools for discovering stays, publishing listings,
        managing bookings, saving places, and sharing reviews. You must use the
        service lawfully, provide accurate information, and keep your account
        credentials secure.
      </LegalSection>
      <LegalSection title="Accounts">
        You are responsible for activity carried out through your account. Keep
        your contact information current and tell us promptly if you believe
        someone has accessed your account without permission. We may restrict
        access when needed to protect users or the service.
      </LegalSection>
      <LegalSection title="Guests and hosts">
        Guests and hosts are responsible for communicating clearly and following
        the details shown for a listing and booking. Hosts must have the rights
        and permissions needed to offer a stay and must keep listing details
        accurate. Guests must follow the host's reasonable property rules and
        the confirmed booking details.
      </LegalSection>
      <LegalSection title="Bookings and cancellations">
        Booking availability, prices, and cancellation terms are shown during
        the booking flow or in booking details. Review those details before
        confirming. Any refund or cancellation outcome depends on the terms
        shown for the specific booking and applicable law.
      </LegalSection>
      <LegalSection title="Reviews and content">
        Only share content you have the right to use. Reviews should describe
        genuine experiences and must not be abusive, deceptive, discriminatory,
        or unlawful. You retain ownership of your content and allow Wanderlust
        to display it as needed to operate the service.
      </LegalSection>
      <LegalSection title="Prohibited use">
        Do not misuse the service, interfere with its security, submit false or
        fraudulent information, harass other users, or use another person's
        account or content without permission.
      </LegalSection>
      <LegalSection title="Availability and changes">
        We may update or suspend features to maintain or improve the service. We
        aim to keep information accurate, but listings and availability are
        provided by users and may change. Wanderlust does not own or operate the
        stays listed by hosts.
      </LegalSection>
      <LegalSection title="Limitation and applicable requirements">
        Nothing in these terms limits rights or remedies that cannot be limited
        under applicable law. These terms operate subject to the laws and
        consumer protections that apply to you.
      </LegalSection>
      <LegalSection title="Contact">
        If you have a question about these terms, contact us through the{" "}
        <Link to="/help">Help Center</Link>.
      </LegalSection>
    </Box>
  );
}

const COOKIE_PREFS_KEY = "wl-cookie-preferences";

export function CookieSettingsPage() {
  const [analytics, setAnalytics] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem(COOKIE_PREFS_KEY) || "{}").analytics ===
        true
      );
    } catch {
      return false;
    }
  });
  const [saved, setSaved] = useState(false);

  const save = () => {
    localStorage.setItem(
      COOKIE_PREFS_KEY,
      JSON.stringify({
        necessary: true,
        analytics,
        updatedAt: new Date().toISOString(),
      }),
    );
    setSaved(true);
  };

  return (
    <Box className="legal-page">
      <PageHeader
        eyebrow="Privacy"
        title="Cookie Settings"
        subtitle="Choose whether this browser may store optional analytics preferences."
      />
      <LegalSection title="Necessary storage">
        Always on. The app uses a session cookie to keep you signed in and a
        CSRF cookie to protect account actions. These are required for core
        functionality.
      </LegalSection>
      <LegalSection title="Analytics">
        Optional. Your choice is saved in this browser. This app currently does
        not load a third-party analytics cookie based on this preference.
      </LegalSection>
      <FormControlLabel
        control={
          <Switch
            checked={analytics}
            onChange={(event) => {
              setAnalytics(event.target.checked);
              setSaved(false);
            }}
          />
        }
        label="Allow analytics cookies"
      />
      <Button
        variant="contained"
        onClick={save}
        sx={{ alignSelf: "flex-start" }}
      >
        Save preferences
      </Button>
      {saved && (
        <Typography role="status" color="success.main">
          Your cookie preferences have been saved in this browser.
        </Typography>
      )}
    </Box>
  );
}
