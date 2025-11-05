import React, { useState, useEffect, useRef } from 'react';
import { PlusCircle, Trash2, Edit2, Download, Upload, TrendingUp, TrendingDown, Wallet, CreditCard, DollarSign, Calendar, Filter, X, Check, AlertTriangle, ChevronDown, Menu, Home, BarChart3, Settings, LogOut, User } from 'lucide-react';

// Utility: Format currency in PKR
const formatPKR = (amount) => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Mock data store (simulating backend)
const initializeMockData = () => {
  const stored = localStorage.getItem('budgetAppData');
  if (stored) return JSON.parse(stored);

  return {
    user: {
      id: '1',
      name: 'Demo User',
      email: 'demo@example.com',
      preferences: { timezone: 'Asia/Karachi', currency: 'PKR' }
    },
    budgets: [
      { id: '1', name: 'Groceries', monthlyLimit: 30000, color: '#10b981', spent: 18500, startDate: '2025-11-01' },
      { id: '2', name: 'Rent', monthlyLimit: 50000, color: '#f59e0b', spent: 50000, startDate: '2025-11-01' },
      { id: '3', name: 'Entertainment', monthlyLimit: 15000, color: '#8b5cf6', spent: 8200, startDate: '2025-11-01' }
    ],
    transactions: [
      { id: '1', budgetId: '1', amount: -2500, type: 'expense', category: 'Food', date: '2025-11-03', notes: 'Weekly groceries', paymentMethod: 'card' },
      { id: '2', budgetId: '1', amount: -3200, type: 'expense', category: 'Food', date: '2025-11-01', notes: 'Market shopping', paymentMethod: 'cash' },
      { id: '3', budgetId: '2', amount: -50000, type: 'expense', category: 'Housing', date: '2025-11-01', notes: 'Monthly rent', paymentMethod: 'bank' },
      { id: '4', budgetId: '3', amount: -4500, type: 'expense', category: 'Entertainment', date: '2025-11-02', notes: 'Cinema tickets', paymentMethod: 'card' },
      { id: '5', budgetId: null, amount: 85000, type: 'income', category: 'Salary', date: '2025-11-01', notes: 'Monthly salary', paymentMethod: 'bank' }
    ]
  };
};

const App = () => {
  const [data, setData] = useState(initializeMockData);
  const [currentView, setCurrentView] = useState('dashboard');
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');

  const appRef = useRef();
  const budgetRefs = useRef({});
  const transactionRefs = useRef({});

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('budgetAppData', JSON.stringify(data));
  }, [data]);

  // CSS animations on mount
  useEffect(() => {
    if (appRef.current) {
      appRef.current.style.animation = 'fadeInUp 0.6s ease-out';
    }
  }, []);

  // Animate budget cards
  useEffect(() => {
    Object.values(budgetRefs.current).forEach((ref, i) => {
      if (ref) {
        ref.style.animation = `fadeInUp 0.5s ease-out ${i * 0.1}s both`;
      }
    });
  }, [data.budgets, currentView]);

  const addBudget = (budget) => {
    const newBudget = {
      id: Date.now().toString(),
      ...budget,
      spent: 0,
      startDate: new Date().toISOString().split('T')[0]
    };
    setData(prev => ({ ...prev, budgets: [...prev.budgets, newBudget] }));
  };

  const updateBudget = (id, updates) => {
    setData(prev => ({
      ...prev,
      budgets: prev.budgets.map(b => b.id === id ? { ...b, ...updates } : b)
    }));
  };

  const deleteBudget = (id) => {
    setData(prev => ({
      ...prev,
      budgets: prev.budgets.filter(b => b.id !== id)
    }));
  };

  const addTransaction = (transaction) => {
    const newTransaction = {
      id: Date.now().toString(),
      ...transaction,
      date: new Date().toISOString().split('T')[0]
    };
    setData(prev => {
      const newTransactions = [...prev.transactions, newTransaction];
      const updatedBudgets = prev.budgets.map(b => {
        if (b.id === transaction.budgetId && transaction.type === 'expense') {
          return { ...b, spent: b.spent + Math.abs(transaction.amount) };
        }
        return b;
      });
      return { ...prev, transactions: newTransactions, budgets: updatedBudgets };
    });
  };

  const deleteTransaction = (id) => {
    const transaction = data.transactions.find(t => t.id === id);
    setData(prev => {
      const updatedBudgets = prev.budgets.map(b => {
        if (b.id === transaction.budgetId && transaction.type === 'expense') {
          return { ...b, spent: Math.max(0, b.spent - Math.abs(transaction.amount)) };
        }
        return b;
      });
      return {
        ...prev,
        transactions: prev.transactions.filter(t => t.id !== id),
        budgets: updatedBudgets
      };
    });
  };

  const totalIncome = data.transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = data.transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const netBalance = totalIncome - totalExpenses;

  const filteredTransactions = filterCategory === 'all'
    ? data.transactions
    : data.transactions.filter(t => t.category === filterCategory);

  const categories = [...new Set(data.transactions.map(t => t.category))];

  return (
    <div ref={appRef} className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes progressGrow {
          from {
            width: 0;
          }
        }
      `}</style>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Wallet className="w-8 h-8 text-emerald-600" />
              <h1 className="text-2xl font-bold text-slate-800">BudgetTracker</h1>
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
            >
              <Menu className="w-6 h-6" />
            </button>
            <nav className="hidden lg:flex items-center space-x-1">
              <NavButton icon={Home} label="Dashboard" active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} />
              <NavButton icon={BarChart3} label="Analytics" active={currentView === 'analytics'} onClick={() => setCurrentView('analytics')} />
              <NavButton icon={Settings} label="Settings" active={currentView === 'settings'} onClick={() => setCurrentView('settings')} />
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-2">
          <nav className="flex flex-col space-y-1">
            <MobileNavButton icon={Home} label="Dashboard" active={currentView === 'dashboard'} onClick={() => { setCurrentView('dashboard'); setMobileMenuOpen(false); }} />
            <MobileNavButton icon={BarChart3} label="Analytics" active={currentView === 'analytics'} onClick={() => { setCurrentView('analytics'); setMobileMenuOpen(false); }} />
            <MobileNavButton icon={Settings} label="Settings" active={currentView === 'settings'} onClick={() => { setCurrentView('settings'); setMobileMenuOpen(false); }} />
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Total Income"
                amount={totalIncome}
                icon={TrendingUp}
                color="text-emerald-600"
                bgColor="bg-emerald-50"
              />
              <StatCard
                title="Total Expenses"
                amount={totalExpenses}
                icon={TrendingDown}
                color="text-red-600"
                bgColor="bg-red-50"
              />
              <StatCard
                title="Net Balance"
                amount={netBalance}
                icon={DollarSign}
                color={netBalance >= 0 ? "text-blue-600" : "text-orange-600"}
                bgColor={netBalance >= 0 ? "bg-blue-50" : "bg-orange-50"}
              />
            </div>

            {/* Budgets Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Budgets</h2>
                <button
                  onClick={() => { setEditingBudget(null); setShowBudgetModal(true); }}
                  className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>Add Budget</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.budgets.map((budget, i) => (
                  <BudgetCard
                    key={budget.id}
                    budget={budget}
                    onEdit={() => { setEditingBudget(budget); setShowBudgetModal(true); }}
                    onDelete={() => deleteBudget(budget.id)}
                    ref={el => budgetRefs.current[budget.id] = el}
                  />
                ))}
              </div>
            </section>

            {/* Transactions Section */}
            <section>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
                <h2 className="text-2xl font-bold text-slate-800">Recent Transactions</h2>
                <div className="flex items-center space-x-3">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => { setEditingTransaction(null); setShowTransactionModal(true); }}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <PlusCircle className="w-5 h-5" />
                    <span>Add Transaction</span>
                  </button>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {filteredTransactions.length === 0 ? (
                  <div className="p-12 text-center text-slate-500">
                    <Wallet className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No transactions yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200">
                    {filteredTransactions.slice().reverse().slice(0, 10).map(transaction => (
                      <TransactionRow
                        key={transaction.id}
                        transaction={transaction}
                        budgets={data.budgets}
                        onDelete={() => deleteTransaction(transaction.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {currentView === 'analytics' && (
          <AnalyticsView transactions={data.transactions} budgets={data.budgets} />
        )}

        {currentView === 'settings' && (
          <SettingsView user={data.user} />
        )}
      </main>

      {/* Modals */}
      {showBudgetModal && (
        <BudgetModal
          budget={editingBudget}
          onSave={(budget) => {
            if (editingBudget) {
              updateBudget(editingBudget.id, budget);
            } else {
              addBudget(budget);
            }
            setShowBudgetModal(false);
            setEditingBudget(null);
          }}
          onClose={() => { setShowBudgetModal(false); setEditingBudget(null); }}
        />
      )}

      {showTransactionModal && (
        <TransactionModal
          transaction={editingTransaction}
          budgets={data.budgets}
          onSave={(transaction) => {
            addTransaction(transaction);
            setShowTransactionModal(false);
            setEditingTransaction(null);
          }}
          onClose={() => { setShowTransactionModal(false); setEditingTransaction(null); }}
        />
      )}
    </div>
  );
};

const NavButton = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${active ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-100'
      }`}
  >
    <Icon className="w-5 h-5" />
    <span className="font-medium">{label}</span>
  </button>
);

const MobileNavButton = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${active ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-100'
      }`}
  >
    <Icon className="w-5 h-5" />
    <span className="font-medium">{label}</span>
  </button>
);

const StatCard = ({ title, amount, icon: Icon, color, bgColor }) => {
  const cardRef = useRef();

  useEffect(() => {
    if (cardRef.current) {
      cardRef.current.style.animation = 'scaleIn 0.4s ease-out';
    }
  }, []);

  return (
    <div ref={cardRef} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-slate-600">{title}</span>
        <div className={`p-2 rounded-lg ${bgColor}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
      <p className={`text-3xl font-bold ${color}`}>{formatPKR(amount)}</p>
    </div>
  );
};

const BudgetCard = React.forwardRef(({ budget, onEdit, onDelete }, ref) => {
  const percentage = Math.min((budget.spent / budget.monthlyLimit) * 100, 100);
  const isOverBudget = budget.spent > budget.monthlyLimit;
  const progressRef = useRef();

  useEffect(() => {
    if (progressRef.current) {
      progressRef.current.style.animation = 'progressGrow 1s ease-out';
    }
  }, []);

  return (
    <div ref={ref} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: budget.color }}></div>
          <h3 className="text-lg font-semibold text-slate-800">{budget.name}</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={onEdit} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <Edit2 className="w-4 h-4 text-slate-600" />
          </button>
          <button onClick={onDelete} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Spent</span>
          <span className="font-semibold text-slate-800">{formatPKR(budget.spent)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Limit</span>
          <span className="font-semibold text-slate-800">{formatPKR(budget.monthlyLimit)}</span>
        </div>
      </div>

      <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          ref={progressRef}
          className={`absolute left-0 top-0 h-full rounded-full transition-all duration-300 ${isOverBudget ? 'bg-red-500' : 'bg-emerald-500'
            }`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className={`text-sm font-medium ${isOverBudget ? 'text-red-600' : 'text-emerald-600'}`}>
          {percentage.toFixed(1)}% used
        </span>
        {isOverBudget && (
          <div className="flex items-center space-x-1 text-red-600">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs font-medium">Over budget!</span>
          </div>
        )}
      </div>
    </div>
  );
});

const TransactionRow = ({ transaction, budgets, onDelete }) => {
  const budget = budgets.find(b => b.id === transaction.budgetId);
  const isIncome = transaction.type === 'income';
  const rowRef = useRef();

  useEffect(() => {
    if (rowRef.current) {
      rowRef.current.style.animation = 'slideInLeft 0.3s ease-out';
    }
  }, []);

  return (
    <div
      ref={rowRef}
      className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group"
    >
      <div className="flex items-center space-x-4 flex-1">
        <div className={`p-2 rounded-lg ${isIncome ? 'bg-emerald-50' : 'bg-red-50'}`}>
          {isIncome ? (
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          ) : (
            <TrendingDown className="w-5 h-5 text-red-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-800 truncate">{transaction.category}</p>
          <p className="text-sm text-slate-500 truncate">{transaction.notes || 'No notes'}</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="text-right">
          <p className={`font-semibold ${isIncome ? 'text-emerald-600' : 'text-red-600'}`}>
            {isIncome ? '+' : '-'}{formatPKR(Math.abs(transaction.amount))}
          </p>
          <p className="text-sm text-slate-500">{new Date(transaction.date).toLocaleDateString('en-PK')}</p>
        </div>
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 rounded-lg transition-all"
        >
          <Trash2 className="w-4 h-4 text-red-600" />
        </button>
      </div>
    </div>
  );
};

const BudgetModal = ({ budget, onSave, onClose }) => {
  const [name, setName] = useState(budget?.name || '');
  const [monthlyLimit, setMonthlyLimit] = useState(budget?.monthlyLimit || '');
  const [color, setColor] = useState(budget?.color || '#10b981');
  const modalRef = useRef();

  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.style.animation = 'scaleIn 0.3s ease-out';
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name, monthlyLimit: parseFloat(monthlyLimit), color });
  };

  const colors = ['#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#3b82f6', '#ec4899'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div ref={modalRef} className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-800">
            {budget ? 'Edit Budget' : 'Create Budget'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Budget Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="e.g., Groceries"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Monthly Limit (PKR)</label>
            <input
              type="number"
              value={monthlyLimit}
              onChange={(e) => setMonthlyLimit(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="30000"
              required
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Color</label>
            <div className="flex items-center space-x-2">
              {colors.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-10 h-10 rounded-lg transition-all ${color === c ? 'ring-2 ring-offset-2 ring-slate-400' : ''
                    }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              Save Budget
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TransactionModal = ({ transaction, budgets, onSave, onClose }) => {
  const [type, setType] = useState(transaction?.type || 'expense');
  const [amount, setAmount] = useState(transaction?.amount ? Math.abs(transaction.amount) : '');
  const [category, setCategory] = useState(transaction?.category || '');
  const [budgetId, setBudgetId] = useState(transaction?.budgetId || '');
  const [notes, setNotes] = useState(transaction?.notes || '');
  const [paymentMethod, setPaymentMethod] = useState(transaction?.paymentMethod || 'cash');
  const modalRef = useRef();

  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.style.animation = 'scaleIn 0.3s ease-out';
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      type,
      amount: type === 'income' ? parseFloat(amount) : -parseFloat(amount),
      category,
      budgetId: type === 'expense' ? budgetId : null,
      notes,
      paymentMethod
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div ref={modalRef} className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-800">Add Transaction</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${type === 'expense' ? 'bg-red-100 text-red-700 border-2 border-red-500' : 'bg-slate-100 text-slate-700'
                  }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${type === 'income' ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-500' : 'bg-slate-100 text-slate-700'
                  }`}
              >
                Income
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Amount (PKR)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="5000"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="e.g., Food, Salary"
              required
            />
          </div>

          {type === 'expense' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Budget</label>
              <select
                value={budgetId}
                onChange={(e) => setBudgetId(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">Select budget (optional)</option>
                {budgets.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="bank">Bank Transfer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Additional details..."
              rows="3"
            />
          </div>

          <div className="flex items-center space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              Add Transaction
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AnalyticsView = ({ transactions, budgets }) => {
  const monthlyData = {};

  transactions.forEach(t => {
    const month = t.date.substring(0, 7);
    if (!monthlyData[month]) {
      monthlyData[month] = { income: 0, expenses: 0 };
    }
    if (t.type === 'income') {
      monthlyData[month].income += t.amount;
    } else {
      monthlyData[month].expenses += Math.abs(t.amount);
    }
  });

  const categoryData = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    categoryData[t.category] = (categoryData[t.category] || 0) + Math.abs(t.amount);
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Financial Analytics</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Monthly Overview</h3>
            <div className="space-y-4">
              {Object.entries(monthlyData).reverse().slice(0, 6).map(([month, data]) => (
                <div key={month} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{new Date(month).toLocaleDateString('en-PK', { month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-emerald-600">Income</span>
                        <span className="font-medium">{formatPKR(data.income)}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min((data.income / 100000) * 100, 100)}%` }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-red-600">Expenses</span>
                        <span className="font-medium">{formatPKR(data.expenses)}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 rounded-full" style={{ width: `${Math.min((data.expenses / 100000) * 100, 100)}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Spending by Category</h3>
            <div className="space-y-3">
              {Object.entries(categoryData).sort((a, b) => b[1] - a[1]).map(([category, amount]) => {
                const total = Object.values(categoryData).reduce((sum, val) => sum + val, 0);
                const percentage = (amount / total) * 100;
                return (
                  <div key={category} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">{category}</span>
                      <span className="text-slate-600">{formatPKR(amount)} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Budget Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map(budget => {
            const percentage = (budget.spent / budget.monthlyLimit) * 100;
            const isOverBudget = budget.spent > budget.monthlyLimit;
            return (
              <div key={budget.id} className="p-4 border border-slate-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: budget.color }}></div>
                  <span className="font-medium text-slate-800">{budget.name}</span>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-slate-600">
                    {formatPKR(budget.spent)} / {formatPKR(budget.monthlyLimit)}
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isOverBudget ? 'bg-red-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                  <div className={`text-xs font-medium ${isOverBudget ? 'text-red-600' : 'text-emerald-600'}`}>
                    {percentage.toFixed(1)}% used
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const SettingsView = ({ user }) => {
  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Settings</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Profile Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
            <input
              type="text"
              value={user.name}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
            <input
              type="email"
              value={user.email}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              readOnly
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Preferences</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Currency</label>
            <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
              <option value="PKR">Pakistani Rupee (PKR)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Timezone</label>
            <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
              <option value="Asia/Karachi">Asia/Karachi</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">About This Demo</h3>
        <p className="text-slate-600 text-sm leading-relaxed">
          This is a demonstration of a budget tracking application. Data is stored locally in your browser using localStorage.
          The full production version would include backend API integration, JWT authentication, email notifications, CSV import/export,
          recurring transactions, and more advanced analytics features.
        </p>
      </div>
    </div>
  );
};

export default App;