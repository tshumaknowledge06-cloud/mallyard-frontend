type Props = {
status: "pending" | "assigned" | "picked_up" | "delivered" | "failed";
};

export default function StatusBadge({ status }: Props) {

const styles = {
pending: "bg-yellow-100 text-yellow-800",
assigned: "bg-blue-100 text-blue-800",
picked_up: "bg-purple-100 text-purple-800",
delivered: "bg-green-100 text-green-800",
failed: "bg-red-100 text-red-800",
};

const labels = {
pending: "Pending",
assigned: "Assigned",
picked_up: "Picked Up",
delivered: "Delivered",
failed: "Failed",
};

return (
<span
className={`px-2 py-1 rounded text-xs font-medium ${styles[status]}`}
>
{labels[status]} </span>
);
}
