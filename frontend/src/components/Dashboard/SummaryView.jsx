import { formatCurrency } from '../../utils/formatters';
import {
  calculateTotalInvested,
  calculateTotalCurrent,
  calculateTotalGain,
  calculateMonthlyExpenses,
  groupExpensesByCategory,
} from '../../utils/calculations';
import { getCurrentMonth } from '../../utils/formatters';
import './SummaryView.css';

export const SummaryView = ({ investments, incomes, expenses }) => {
  // Safe arrays for rendering
  const invArray = Array.isArray(investments) ? investments : [];
  const incArray = Array.isArray(incomes) ? incomes : [];
  const expArray = Array.isArray(expenses) ? expenses : [];

  const totalInvested = calculateTotalInvested(invArray);
  const totalCurrent = calculateTotalCurrent(invArray);
  const totalGain = calculateTotalGain(invArray);
  
  const currentMonth = getCurrentMonth();
  const monthlyExpenses = expArray.filter(e => e.date?.startsWith(currentMonth));
  // Show ALL income on dashboard, not just current month
  const monthlyIncomes = incArray;
  const totalMonthlyExpense = calculateMonthlyExpenses(expArray);
  
  const byCategory = groupExpensesByCategory(monthlyExpenses);

  // Calculate totals for the progress bar
  // Income: Sum of ALL income entries (not limited to current month)
  const totalIncome = monthlyIncomes.reduce((sum, inc) => sum + (inc.amount || 0), 0);
  
  const totalExpenses = totalMonthlyExpense;
  const totalSavings = totalGain >= 0 ? totalGain : 0;
  
  // Net Total = Income - Expenses - Investments + Investment Gains
  const netTotal = totalIncome - totalExpenses - totalInvested + totalSavings;

  // Calculate percentages for progress bar
  const total = totalIncome + totalExpenses + totalInvested + totalSavings;
  const incomePercent = total > 0 ? (totalIncome / total) * 100 : 0;
  const expensesPercent = total > 0 ? (totalExpenses / total) * 100 : 0;
  const investmentPercent = total > 0 ? (totalInvested / total) * 100 : 0;
  const savingsPercent = total > 0 ? (totalSavings / total) * 100 : 0;

  // Mock year-over-year data (you can calculate this from historical data)
  const yoyIncomeChange = 13; // +13%
  const yoyExpensesChange = 4; // +4%
  const yoyInvestmentChange = -8; // -8%
  const yoySavingsChange = 3; // +3%

  return (
    <div className="summary-view">
      {/* Net Total Summary */}
      <div className="net-total-section">
        <div className="year-selector">
          <span>2025</span>
        </div>
        
        <div className="net-total-card">
          <span className="net-label">Net Total</span>
          <div className="net-amount">
            {formatCurrency(netTotal)}
            <span className="currency-symbol">₹</span>
          </div>
          <span className="yoy-change positive">
            ↑ +4.3% from last year
          </span>
        </div>

        {/* Progress Bar */}
        <div className="progress-bar">
          <div className="progress-segment income" style={{ width: `${incomePercent}%` }} />
          <div className="progress-segment expenses" style={{ width: `${expensesPercent}%` }} />
          <div className="progress-segment investment" style={{ width: `${investmentPercent}%` }} />
          <div className="progress-segment savings" style={{ width: `${savingsPercent}%` }} />
        </div>
      </div>

      {/* Metric Cards */}
      <div className="metrics-grid">
        {/* Income Card */}
        <div className="metric-card income-card">
          <div className="metric-header">
            <span className="metric-name">Income</span>
            <span className="metric-percentage">{Math.round(incomePercent)}%</span>
          </div>
          <div className="metric-value">{formatCurrency(totalIncome)}</div>
          <div className="metric-footer">
            <span className={yoyIncomeChange >= 0 ? 'change positive' : 'change negative'}>
              {yoyIncomeChange >= 0 ? '↑' : '↓'} {Math.abs(yoyIncomeChange)}% vs last year
            </span>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="metric-card expenses-card">
          <div className="metric-header">
            <span className="metric-name">Expenses</span>
            <span className="metric-percentage">{Math.round(expensesPercent)}%</span>
          </div>
          <div className="metric-value">{formatCurrency(totalExpenses)}</div>
          <div className="metric-footer">
            <span className={yoyExpensesChange >= 0 ? 'change negative' : 'change positive'}>
              {yoyExpensesChange >= 0 ? '↑' : '↓'} {Math.abs(yoyExpensesChange)}% vs last year
            </span>
          </div>
        </div>

        {/* Investment Card */}
        <div className="metric-card investment-card">
          <div className="metric-header">
            <span className="metric-name">Investment</span>
            <span className="metric-percentage">{Math.round(investmentPercent)}%</span>
          </div>
          <div className="metric-value">{formatCurrency(totalInvested)}</div>
          <div className="metric-footer">
            <span className={yoyInvestmentChange >= 0 ? 'change positive' : 'change negative'}>
              {yoyInvestmentChange >= 0 ? '↑' : '↓'} {Math.abs(yoyInvestmentChange)}% vs last year
            </span>
          </div>
        </div>

        {/* Savings Card */}
        <div className="metric-card savings-card">
          <div className="metric-header">
            <span className="metric-name">Savings</span>
            <span className="metric-percentage">{Math.round(savingsPercent)}%</span>
          </div>
          <div className="metric-value">{formatCurrency(totalSavings)}</div>
          <div className="metric-footer">
            <span className={yoySavingsChange >= 0 ? 'change positive' : 'change negative'}>
              {yoySavingsChange >= 0 ? '↑' : '↓'} {Math.abs(yoySavingsChange)}% vs last year
            </span>
          </div>
        </div>
      </div>

      {/* Recent Transactions Preview */}
      <div className="transactions-preview">
        <div className="section-header">
          <h3>Recent Transactions</h3>
          <span className="subtitle">
            You had {monthlyExpenses.length} expenses this month
          </span>
        </div>

        <div className="transactions-list">
          {monthlyExpenses.length > 0 ? (
            monthlyExpenses.slice(0, 5).map((expense, index) => (
              <div key={index} className="transaction-item">
                <div className="transaction-info">
                  <span className="transaction-icon">💳</span>
                  <div className="transaction-details">
                    <span className="transaction-name">{expense.description || 'Expense'}</span>
                    <span className="transaction-category">{expense.category}</span>
                  </div>
                </div>
                <span className="transaction-amount negative">
                  -{formatCurrency(expense.amount)}
                </span>
              </div>
            ))
          ) : (
            <div className="empty-transactions">
              <p>No transactions yet this month</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
