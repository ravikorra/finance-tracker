import { formatCurrency } from '../../utils/formatters';
import {
  calculateTotalInvested,
  calculateTotalCurrent,
  calculateTotalGain,
  calculateGainPercentage,
  calculateMonthlyExpenses,
  groupExpensesByCategory,
  groupInvestmentsByType,
} from '../../utils/calculations';
import { getCurrentMonth } from '../../utils/formatters';
import { PieChart, Pie, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './AnalyticsView.css';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#f97316'];

export const AnalyticsView = ({ investments, incomes, expenses, selectedMonth = null }) => {
  // Safe arrays for rendering
  const invArray = Array.isArray(investments) ? investments : [];
  const incArray = Array.isArray(incomes) ? incomes : [];
  const expArray = Array.isArray(expenses) ? expenses : [];

  // Get current month if not selected
  const currentMonth = selectedMonth || getCurrentMonth();

  // Filter by selected month/year
  const monthlyInvArray = invArray.filter(inv => inv.date?.startsWith(currentMonth));
  const monthlyIncArray = incArray.filter(inc => inc.date?.startsWith(currentMonth));
  const monthlyExpArray = expArray.filter(exp => exp.date?.startsWith(currentMonth));

  const totalInvested = calculateTotalInvested(monthlyInvArray);
  const totalCurrent = calculateTotalCurrent(monthlyInvArray);
  const totalGain = calculateTotalGain(monthlyInvArray);
  
  // Calculate total income for selected month
  const totalMonthlyIncome = monthlyIncArray.reduce((sum, inc) => sum + (inc.amount || 0), 0);
  const gainPct = calculateGainPercentage(monthlyInvArray);
  
  const monthlyExpenses = monthlyExpArray;
  const totalMonthly = calculateMonthlyExpenses(monthlyExpArray);
  
  const byCategory = groupExpensesByCategory(monthlyExpenses);
  const byInvType = groupInvestmentsByType(invArray);

  // Prepare data for Pie Chart (Expense Categories)
  const categoryChartData = Object.entries(byCategory).map(([name, value]) => ({
    name,
    value
  }));

  // Prepare data for Investment Types Pie Chart
  const investmentTypeData = Object.entries(byInvType).map(([name, data]) => ({
    name,
    value: data.current
  }));

  // Prepare data for Monthly Expense Trend (last 6 months)
  const getMonthlyTrends = () => {
    const trends = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toISOString().slice(0, 7);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      
      const monthExpenses = expArray.filter(e => e.date?.startsWith(monthKey));
      const total = monthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      
      trends.push({
        month: monthName,
        amount: total
      });
    }
    
    return trends;
  };

  const monthlyTrends = getMonthlyTrends();

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="label">{label}</p>
          <p className="value">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="analytics-view">
      {/* Summary Metrics Row */}
      <div className="analytics-summary">
        <div className="summary-metric">
          <div className="metric-icon net-worth">💰</div>
          <div className="metric-content">
            <span className="metric-label">Net Worth</span>
            <span className="metric-value">{formatCurrency(totalCurrent)}</span>
            <span className={totalGain >= 0 ? 'metric-change positive' : 'metric-change negative'}>
              {totalGain >= 0 ? '↑' : '↓'} {formatCurrency(Math.abs(totalGain))} ({gainPct.toFixed(1)}%)
            </span>
          </div>
        </div>

        <div className="summary-metric">
          <div className="metric-icon invested">📈</div>
          <div className="metric-content">
            <span className="metric-label">Total Invested</span>
            <span className="metric-value">{formatCurrency(totalInvested)}</span>
          </div>
        </div>

        <div className="summary-metric">
          <div className="metric-icon monthly">💳</div>
          <div className="metric-content">
            <span className="metric-label">This Month Spent</span>
            <span className="metric-value">{formatCurrency(totalMonthly)}</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-container">
        {/* Expense Category Pie Chart */}
        {categoryChartData.length > 0 ? (
          <div className="chart-box">
            <h3 className="chart-title">Spending by Category</h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="chart-box empty">
            <h3 className="chart-title">Spending by Category</h3>
            <div className="empty-state">
              <div className="empty-icon">💳</div>
              <p>No expenses yet</p>
            </div>
          </div>
        )}

        {/* Monthly Expense Trend Bar Chart */}
        {monthlyTrends.some(t => t.amount > 0) ? (
          <div className="chart-box">
            <h3 className="chart-title">6-Month Expense Trend</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis dataKey="month" stroke="rgba(255, 255, 255, 0.6)" />
                <YAxis stroke="rgba(255, 255, 255, 0.6)" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="amount" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="chart-box empty">
            <h3 className="chart-title">6-Month Expense Trend</h3>
            <div className="empty-state">
              <div className="empty-icon">📈</div>
              <p>Start tracking expenses to see trends</p>
            </div>
          </div>
        )}

        {/* Investment Types Distribution */}
        {investmentTypeData.length > 0 ? (
          <div className="chart-box">
            <h3 className="chart-title">Portfolio Distribution</h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={investmentTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {investmentTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="chart-box empty">
            <h3 className="chart-title">Portfolio Distribution</h3>
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <p>No investments yet</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
