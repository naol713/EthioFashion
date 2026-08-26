import { getAuditLogs } from '@/actions/admin/audit-logs';

export default async function AdminAuditLogsPage() {
  const logs = await getAuditLogs();
  return <div className="space-y-5"><div><h2 className="text-2xl font-bold">Audit logs</h2><p className="text-gray-600 mt-1">Recent administrative changes.</p></div><div className="bg-white rounded-xl border overflow-x-auto"><table className="w-full text-sm"><thead className="bg-gray-50 text-left"><tr><th className="p-4">Time</th><th className="p-4">Action</th><th className="p-4">Entity</th><th className="p-4">Entity ID</th><th className="p-4">Actor</th></tr></thead><tbody className="divide-y">{logs.map((log) => <tr key={log.id}><td className="p-4">{log.created_at.toLocaleString()}</td><td className="p-4 font-medium">{log.action}</td><td className="p-4">{log.entity_type}</td><td className="p-4 font-mono text-xs">{log.entity_id}</td><td className="p-4 font-mono text-xs">{log.actor_user_id || '-'}</td></tr>)}</tbody></table></div></div>;
}