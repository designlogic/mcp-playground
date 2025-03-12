import { z } from "zod";
declare const pizzaOrderSchema: z.ZodObject<{
    size: z.ZodEnum<["small", "medium", "large"]>;
    crust: z.ZodEnum<["thin", "thick", "stuffed", "gluten-free"]>;
    sauce: z.ZodEnum<["tomato", "bbq", "garlic", "alfredo"]>;
    toppings: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    size: "small" | "medium" | "large";
    crust: "thin" | "thick" | "stuffed" | "gluten-free";
    sauce: "tomato" | "bbq" | "garlic" | "alfredo";
    toppings?: string[] | undefined;
}, {
    size: "small" | "medium" | "large";
    crust: "thin" | "thick" | "stuffed" | "gluten-free";
    sauce: "tomato" | "bbq" | "garlic" | "alfredo";
    toppings?: string[] | undefined;
}>;
type PizzaOrderType = z.infer<typeof pizzaOrderSchema>;
export declare class PizzaAgent {
    private openai;
    private mcpClient;
    private availableTools;
    constructor(apiKey: string);
    initialize(): Promise<boolean>;
    createOrder(userRequest: string): Promise<PizzaOrderType>;
    submitOrder(order: PizzaOrderType): Promise<string>;
    disconnect(): Promise<void>;
}
export {};
