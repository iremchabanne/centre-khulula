import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Pager from '../../components/Pager';

// Screen 11 of arborescence-ecrans.md, administrators only.
type Donation = {
  id: number;
  amount: string;
  donor_name: string | null;
  donor_email: string | null;
  message: string | null;
  consent_given: boolean;
  created_at: string;
};

export default function DonationListPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loadError, setLoadError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(`/api/donations?page=${page}`);

        if (response.status === 401) {
          navigate('/staff/session-expired', { replace: true });
          return;
        }

        // A keeper who typed the address by hand. The menu hides the link; the
        // server is what refuses, and this is the screen that says so.
        if (response.status === 403) {
          navigate('/staff/denied', { replace: true });
          return;
        }

        if (!response.ok) {
          setLoadError('The donations could not be loaded.');
          return;
        }

        const answer = await response.json();
        setDonations(answer.items);
        setTotalPages(answer.total_pages);
        setTotal(answer.total);
      } catch {
        setLoadError('The server cannot be reached.');
      }
    }

    load();
  }, [page, navigate]);

  if (loadError !== '') {
    return <p className="text-khulula-error">{loadError}</p>;
  }

  return (
    <div>
      <h1 className="font-heading text-2xl text-khulula-ink">Donations</h1>
      <p className="mb-6 text-sm text-khulula-muted">
        Recorded intentions to give. The centre takes no payment here: no card is ever asked for.
        The email address is the only way to thank a donor or come back to them.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-khulula-surface-alt text-left text-xs uppercase tracking-wide">
            <tr>
              <th scope="col" className="p-3">Date</th>
              <th scope="col" className="p-3">Amount</th>
              <th scope="col" className="p-3">Donor</th>
              <th scope="col" className="p-3">Email</th>
              <th scope="col" className="p-3">Message</th>
            </tr>
          </thead>
          <tbody>
            {donations.map((donation) => (
              <tr key={donation.id} className="border-b border-khulula-line">
                <td className="p-3">{donation.created_at.slice(0, 10)}</td>
                <th scope="row" className="p-3 text-left font-medium">R {donation.amount}</th>
                {/* A donor who did not consent has nothing stored in these
                    columns at all, so an anonymous gift simply has none. */}
                <td className="p-3">{donation.donor_name ?? 'Anonymous'}</td>
                <td className="p-3">{donation.donor_email ?? '—'}</td>
                <td className="p-3">{donation.message ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pager page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
    </div>
  );
}
