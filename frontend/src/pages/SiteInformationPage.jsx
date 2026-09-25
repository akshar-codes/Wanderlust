import { Box, Button, Card, Typography } from "@mui/material";
import { Link, useParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";

const CONTENT = {
  newsroom: {
    group: "Company",
    title: "Newsroom",
    subtitle: "Updates from Wanderlust.",
    body: "Wanderlust product announcements and company news will be shared here. There are no published newsroom updates yet.",
    links: [{ label: "About Wanderlust", to: "/about" }],
  },
  careers: {
    group: "Company",
    title: "Careers",
    subtitle: "Build better ways to discover and host stays.",
    body: "There are no open roles published on this site right now. When opportunities are available, this page will list the role, location, and application details.",
    links: [{ label: "About Wanderlust", to: "/about" }],
  },
  investors: {
    group: "Company",
    title: "Investors",
    subtitle: "Company information.",
    body: "Wanderlust does not currently publish investor materials through this website. This page will be updated if public company information becomes available.",
    links: [{ label: "About Wanderlust", to: "/about" }],
  },
  "gift-cards": {
    group: "Company",
    title: "Gift cards",
    subtitle: "Give someone a trip to look forward to.",
    body: "Gift cards are not currently available to purchase or redeem on Wanderlust. We will update this page if that changes.",
    links: [{ label: "Explore stays", to: "/listings" }],
  },
  "brand-assets": {
    group: "Company",
    title: "Brand assets",
    subtitle: "Wanderlust name and identity.",
    body: "The Wanderlust name and compass mark identify this service. A downloadable brand kit and usage license are not currently available. Please do not imply endorsement or alter the mark in a way that misrepresents Wanderlust.",
    links: [{ label: "About Wanderlust", to: "/about" }],
  },
  safety: {
    group: "Support",
    title: "Safety information",
    subtitle: "Practical steps for using a stay marketplace with care.",
    body: "Review listing details and house rules before booking. Keep booking conversations and arrangements tied to your Wanderlust account, confirm important details with the host, and use the booking page to review the confirmed stay. If you believe a listing, review, or account is unsafe or misleading, submit a report for that item.",
    links: [
      { label: "Report a concern", to: "/support/report" },
      { label: "View listings", to: "/listings" },
    ],
  },
  cancellations: {
    group: "Support",
    title: "Cancellation options",
    subtitle: "Review the terms for your specific reservation.",
    body: "Cancellation terms can vary by booking. Open Booking History and select the reservation to review its current status and available actions. Any refund outcome is determined by the terms shown for that booking and applicable requirements.",
    links: [
      { label: "Booking history", to: "/dashboard/bookings" },
      { label: "Terms of Service", to: "/terms" },
    ],
  },
  accessibility: {
    group: "Support",
    title: "Accessibility",
    subtitle: "Find and manage accessible stay details.",
    body: "Hosts can describe accessibility features in listing details. Review those details carefully and contact the host through the booking flow when you need to confirm whether a space meets your needs. If you have trouble using this website, visit the Help Center for account and navigation guidance.",
    links: [
      { label: "Browse listings", to: "/listings" },
      { label: "Help Center", to: "/help" },
    ],
  },
  contact: {
    group: "Support",
    title: "Contact us",
    subtitle: "Choose the right place to get help.",
    body: "This site does not currently provide a general support inbox or contact form. For booking questions, open the reservation in your account; for account preferences, open Settings; for a safety or content issue, use Report a concern.",
    links: [
      { label: "Help Center", to: "/help" },
      { label: "Report a concern", to: "/support/report" },
      { label: "Settings", to: "/settings" },
    ],
  },
};

export default function SiteInformationPage() {
  const { slug } = useParams();
  const page = CONTENT[slug];
  if (!page) return null;

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", px: { xs: 2, md: 4 }, pb: 8 }}>
      <PageHeader
        eyebrow={page.group}
        title={page.title}
        subtitle={page.subtitle}
      />
      <Card variant="raised" sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 4 }}>
        <Typography
          sx={{ color: "var(--color-text-secondary)", lineHeight: 1.8 }}
        >
          {page.body}
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mt: 3 }}>
          {page.links.map((item) => (
            <Button
              key={item.to}
              component={Link}
              to={item.to}
              variant="outlined"
              endIcon={<ArrowRight size={16} />}
            >
              {item.label}
            </Button>
          ))}
        </Box>
      </Card>
    </Box>
  );
}
