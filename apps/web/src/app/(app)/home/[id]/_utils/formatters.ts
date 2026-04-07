export function formatCurrency(amount: number | string) {
    return Number(amount).toLocaleString("vi-VN");
}

export function formatDate(dateString?: string) {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}
