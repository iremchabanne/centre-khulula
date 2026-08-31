import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Button from '../../components/Button';
import FormField from '../../components/FormField';
import Pager from '../../components/Pager';
import CreateStaffDialog from './CreateStaffDialog';
import ResetPasswordDialog from './ResetPasswordDialog';

// Screen 12 of arborescence-ecrans.md, administrators only.
type StaffMember = {
  id: number;
  full_name: string;
  email: string;
  role: 'keeper' | 'veterinarian';
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
};

export default function StaffAccountsPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [creating, setCreating] = useState(false);
  // Whose password is being reset, or null when the dialog is closed.
  const [resetting, setResetting] = useState<StaffMember | null>(null);
  const [notice, setNotice] = useState('');
  // Bumped after a creation. It is in the dependencies below, so the list is
  // fetched again.
  const [reloadCount, setReloadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const params = new URLSearchParams();
      params.set('page', String(page));
      if (search) params.set('search', search);

      try {
        const response = await fetch(`/api/staff?${params}`);

        if (response.status === 401) {
          navigate('/staff/session-expired', { replace: true });
          return;
        }

        // A keeper who typed the address by hand. The menu hides the link; the
        // server is what refuses.
        if (response.status === 403) {
          navigate('/staff/denied', { replace: true });
          return;
        }

        if (!response.ok) {
          setLoadError('The accounts could not be loaded.');
          return;
        }

        const answer = await response.json();
        setStaff(answer.items);
        setTotalPages(answer.total_pages);
        setTotal(answer.total);
        setLoadError('');
      } catch {
        setLoadError('The server cannot be reached.');
      }
    }

    load();
  }, [search, page, reloadCount, navigate]);

  // RG14 — the two forbidden cases (your own account, the last active
  // administrator) are refused by the server with a 409 and its message.
  async function toggleActive(member: StaffMember) {
    try {
      const response = await fetch(`/api/staff/${member.id}/active`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !member.is_active }),
      });

      if (response.status === 401) {
        navigate('/staff/session-expired', { replace: true });
        return;
      }

      const answer = await response.json();

      if (!response.ok) {
        setActionError(answer.error);
        return;
      }

      // The API returns the updated account, so the row is replaced in place
      // instead of asking for the whole list again.
      setStaff(staff.map((one) => (one.id === member.id ? answer : one)));
      setActionError('');
    } catch {
      setActionError('The server cannot be reached.');
    }
  }

  // Searched on submit, not on every keystroke: one request per search.
  function applySearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    setSearch(String(formData.get('search') ?? '').trim());
    setPage(1);
  }

  return (
    <div>
      <h1 className="mb-2 font-heading text-2xl text-khulula-ink">Staff accounts</h1>
      <p className="mb-6 text-sm text-khulula-muted">
        An account is never deleted, only deactivated: the stays and observations it signed keep
        pointing at a real name.
      </p>

      {/* The search and the button on one row, the button set a little apart.
          flex-wrap drops it onto its own line when the screen is narrow. */}
      <div className="mb-6 flex flex-wrap items-end gap-3">
        <form onSubmit={applySearch} className="flex flex-wrap items-end gap-3">
          <FormField id="search" label="Name or email" required={false} />

          <Button type="submit">Search</Button>

          <Button
            type="reset"
            variant="ghost"
            onClick={() => {
              setSearch('');
              setPage(1);
            }}
          >
            Clear
          </Button>
        </form>

        <div className="ml-4">
          <Button variant="accent" onClick={() => setCreating(true)}>
            New account
          </Button>
        </div>
      </div>

      {creating && (
        <CreateStaffDialog
          onClose={() => setCreating(false)}
          onCreated={() => {
            setCreating(false);
            setReloadCount(reloadCount + 1);
          }}
        />
      )}

      {resetting && (
        <ResetPasswordDialog
          staffId={resetting.id}
          staffName={resetting.full_name}
          onClose={() => setResetting(null)}
          onReset={() => {
            setNotice(`The password of ${resetting.full_name} has been reset.`);
            setResetting(null);
          }}
        />
      )}

      {notice !== '' && (
        <p
          role="status"
          className="mb-4 rounded border border-khulula-primary bg-khulula-surface-alt p-3 text-sm text-khulula-primary"
        >
          {notice}
        </p>
      )}

      {loadError !== '' && (
        <p role="status" className="mb-4 text-sm text-khulula-error">
          {loadError}
        </p>
      )}

      {actionError !== '' && (
        <p role="status" className="mb-4 text-sm text-khulula-error">
          {actionError}
        </p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-khulula-surface-alt text-left text-xs uppercase tracking-wide">
            <tr>
              <th scope="col" className="p-2">Name</th>
              <th scope="col" className="p-2">Email</th>
              <th scope="col" className="p-2">Role</th>
              <th scope="col" className="p-2">Status</th>
              {/* Centred over the two buttons; the thead is left-aligned. */}
              <th scope="col" className="p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((member) => (
              <tr key={member.id} className="border-b border-khulula-line">
                <th scope="row" className="p-2 text-left font-medium">
                  {member.full_name}
                </th>
                <td className="p-2">{member.email}</td>
                <td className="p-2">
                  {member.role === 'keeper' ? 'Keeper' : 'Veterinarian'}
                  {/* On its own line, so the column stays narrow. */}
                  {member.is_admin && <span className="block">Administrator</span>}
                </td>
                <td className="p-2">{member.is_active ? 'Active' : 'Inactive'}</td>
                <td className="p-2">
                  <div className="flex justify-center gap-2">
                    <Button variant="ghost" onClick={() => toggleActive(member)}>
                      {/* The label reserves the width of the longer of the two
                          words, so the button does not resize when it changes. */}
                      <span className="inline-block min-w-24">
                        {member.is_active ? 'Deactivate' : 'Activate'}
                      </span>
                    </Button>

                    <Button variant="ghost" onClick={() => setResetting(member)}>
                      Reset password
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {staff.length === 0 && loadError === '' && (
        <p className="py-6 text-khulula-muted">No account matches this search.</p>
      )}

      <Pager page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
    </div>
  );
}
