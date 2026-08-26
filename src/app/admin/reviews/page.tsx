import { getReviews, moderateReview } from '@/actions/admin/reviews';

export default async function AdminReviewsPage() {
  const reviews = await getReviews();
  async function moderate(formData: FormData) {
    'use server';
    await moderateReview(String(formData.get('id')), String(formData.get('status')) as 'APPROVED' | 'REJECTED' | 'PENDING');
  }
  return <div className="space-y-5"><div><h2 className="text-2xl font-bold">Reviews</h2><p className="text-gray-600 mt-1">Moderate customer feedback before publication.</p></div><div className="space-y-3">{reviews.map((review) => <div key={review.id} className="bg-white rounded-xl border p-5 flex flex-wrap justify-between gap-4"><div><p className="font-semibold">{review.product.name} · {review.rating}/5</p><p className="text-sm text-gray-600 mt-1">{review.title || 'Untitled'} by {review.user.first_name} {review.user.last_name}</p><p className="mt-2 text-sm">{review.comment || 'No comment'}</p></div><form action={moderate} className="flex items-start gap-2"><input type="hidden" name="id" value={review.id} /><select name="status" defaultValue={review.status} className="h-9 border rounded-md px-2"><option value="PENDING">Pending</option><option value="APPROVED">Approved</option><option value="REJECTED">Rejected</option></select><button className="h-9 px-3 rounded-md bg-[#0a0a0a] text-white" type="submit">Save</button></form></div>)}</div>{reviews.length === 0 && <p className="text-gray-600">No reviews yet.</p>}</div>;
}