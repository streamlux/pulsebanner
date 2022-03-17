import useSWR from "swr";
import { APIPaymentObject, PaymentPlan } from "../database/paymentHelpers";

export function usePaymentPlan(): [PaymentPlan, APIPaymentObject | undefined] {
    const { data: paymentPlanResponse } = useSWR<APIPaymentObject>('payment', async () => (await fetch('/api/user/subscription')).json());
    const paymentPlan: PaymentPlan = paymentPlanResponse === undefined ? 'Free' : paymentPlanResponse.plan;
    return [paymentPlan, paymentPlanResponse];
}
