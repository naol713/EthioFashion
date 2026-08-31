import { getInventory } from "@/actions/admin/inventory";
import { InventoryAdjustForm } from "@/components/admin/inventory-adjust-form";

export default async function AdminInventoryPage() {
  const inventory = await getInventory();

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold">Inventory</h2>
        <p className="text-gray-600 mt-1">
          Monitor available stock and record adjustments.
        </p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-red-100 border border-red-300" />
          Low stock (at or below threshold)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-white border border-gray-200" />
          Normal stock
        </span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600 font-semibold">
            <tr>
              <th className="p-4">Product / Variant</th>
              <th className="p-4">SKU</th>
              <th className="p-4 text-center">Total</th>
              <th className="p-4 text-center">Reserved</th>
              <th className="p-4 text-center">Available</th>
              <th className="p-4 text-center">Threshold</th>
              <th className="p-4">
                Adjust &nbsp;/&nbsp; Note &nbsp;/&nbsp; Save
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {inventory.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-400">
                  No inventory records found.
                </td>
              </tr>
            )}
            {inventory.map((item) => {
              const available = item.quantity - item.reserved_quantity;
              const isLow = available <= item.low_stock_threshold;
              return (
                <tr key={item.id} className={isLow ? "bg-red-50" : ""}>
                  <td className="p-4 font-medium text-gray-900">
                    {item.variant.product.name}
                    {item.variant.size?.name && (
                      <span className="ml-2 text-xs text-gray-500 font-normal">
                        Size: {item.variant.size.name}
                      </span>
                    )}
                    {item.variant.color?.name && (
                      <span className="ml-2 text-xs text-gray-500 font-normal">
                        Color: {item.variant.color.name}
                      </span>
                    )}
                  </td>
                  <td className="p-4 font-mono text-xs text-gray-600">
                    {item.variant.sku}
                  </td>
                  <td className="p-4 text-center">{item.quantity}</td>
                  <td className="p-4 text-center text-amber-600">
                    {item.reserved_quantity}
                  </td>
                  <td
                    className={`p-4 text-center font-bold ${isLow ? "text-red-600" : "text-green-700"}`}
                  >
                    {available}
                    {isLow && (
                      <span className="ml-1 text-xs font-normal bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">
                        Low
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-center text-gray-500">
                    {item.low_stock_threshold}
                  </td>
                  <td className="p-4">
                    <InventoryAdjustForm variantId={item.variant_id} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
