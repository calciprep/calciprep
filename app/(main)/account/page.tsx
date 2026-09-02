import AccountClient from '@/components/features/account/AccountClient';

export default function AccountPage() {
  // The page now simply renders the client component,
  // which handles fetching data via context and rendering logic.
  return <AccountClient />;
}
