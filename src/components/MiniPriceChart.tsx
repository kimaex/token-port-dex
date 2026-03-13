import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

const generateChartData = () => {
  const data = [];
  let price = 43000 + Math.random() * 2000;
  for (let i = 0; i < 24; i++) {
    price += (Math.random() - 0.48) * 500;
    data.push({
      time: `${i}:00`,
      price: Math.round(price * 100) / 100,
    });
  }
  return data;
};

const chartData = generateChartData();
const isPositive = chartData[chartData.length - 1].price >= chartData[0].price;

export default function MiniPriceChart() {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-xs text-muted-foreground">BTC/USDC • 24h</p>
          <p className="text-lg font-bold text-foreground">
            ${chartData[chartData.length - 1].price.toLocaleString()}
          </p>
        </div>
        <span className={`text-sm font-semibold ${isPositive ? "text-green-400" : "text-red-400"}`}>
          {isPositive ? "+" : ""}
          {(((chartData[chartData.length - 1].price - chartData[0].price) / chartData[0].price) * 100).toFixed(2)}%
        </span>
      </div>
      <ResponsiveContainer width="100%" height={100}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="miniChartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isPositive ? "hsl(142, 71%, 45%)" : "hsl(0, 84%, 60%)"} stopOpacity={0.3} />
              <stop offset="100%" stopColor={isPositive ? "hsl(142, 71%, 45%)" : "hsl(0, 84%, 60%)"} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="time" hide />
          <YAxis hide domain={["dataMin - 100", "dataMax + 100"]} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            labelStyle={{ color: "hsl(var(--muted-foreground))" }}
            formatter={(value: number) => [`$${value.toLocaleString()}`, "Price"]}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke={isPositive ? "hsl(142, 71%, 45%)" : "hsl(0, 84%, 60%)"}
            strokeWidth={2}
            fill="url(#miniChartGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
