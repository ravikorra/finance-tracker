import { formatCurrency } from '../../utils/formatters';
import {
  calculateTotalInvested,
  calculateTotalCurrent,
  calculateTotalGain,
  calculateGainPercentage,
  calculateMonthlyExpenses,
  groupExpensesByCategory,
  groupExpensesByMember,
  groupInvestmentsByType,
} from '../../utils/calculations';
import { getCurrentMonth } from '../../utils/formatters';
import './Dashboard.css';

export const Dashboard = ({ investments, expenses }) => {
  const totalInvested = calculateTotalInvested(investments);
  const totalCurrent = calculateTotalCurrent(investments);
  const totalGain = calculateTotalGain(investments);
  const gainPct = calculateGainPercentage(investments);
  
  const currentMonth = getCurrentMonth();
  const monthlyExpenses = expenses.filter(e => e.date?.startsWith(currentMonth));
  const totalMonthly = calculateMonthlyExpenses(expenses);
  
  const byCategory = groupExpensesByCategory(monthlyExpenses);
  const byMember = groupExpensesByMember(monthlyExpenses);
  const byInvType = groupInvestmentsByType(investments);

  return (
    <div className="dashboard">
      {/* Net Worth Card */}
      <div className="card hero">
        <span className="label">Net Worth</span>
        <span className="value">{formatCurrency(totalCurrent)}</span>
        <span className={totalGain >= 0 ? 'gain' : 'loss'}>
          {totalGain >= 0 ? '↑' : '↓'} {formatCurrency(Math.abs(totalGain))} ({gainPct.toFixed(1)}%)
        </span>
      </div>

      {/* Summary Cards */}
      <div className="grid-2">
        <div className="card">
          <span className="label">Invested</span>
          <span className="value">{formatCurrency(totalInvested)}</span>
        </div>
        <div className="card">
          <span className="label">This Month Spent</span>
          <span className="value loss">{formatCurrency(totalMonthly)}</span>
        </div>
      </div>

      {/* Analysis Cards */}
      <div className="grid-3">
        {/* Portfolio Allocation */}
        {Object.keys(byInvType).length > 0 && (
          <div className="card">
            <h3>Portfolio Allocation</h3>
            {Object.entries(byInvType).map(([type, v]) => (
              <div key={type} className="row">
                <span>{type}</span>
                <span>
                  {formatCurrency(v.current)}{' '}
                  <span className={v.current >= v.invested ? 'gain' : 'loss'}>
                    ({((v.current - v.invested) / v.invested * 100).toFixed(1)}%)
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Expenses by Category */}
        {Object.keys(byCategory).length > 0 && (
          <div className="card">
            <h3>Expenses by Category</h3>
            {Object.entries(byCategory)
              .sort((a, b) => b[1] - a[1])
              .map(([cat, amt]) => (
                <div key={cat} className="row">
                  <span>{cat}</span>
                  <span>{formatCurrency(amt)}</span>
                </div>
              ))}
          </div>
        )}

        {/* Expenses by Member */}
        {Object.keys(byMember).length > 0 && (
          <div className="card">
            <h3>Expenses by Member</h3>
            {Object.entries(byMember).map(([member, amt]) => (
              <div key={member} className="row">
                <span>{member}</span>
                <span>{formatCurrency(amt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
