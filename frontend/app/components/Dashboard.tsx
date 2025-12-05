"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Button,
  Tag,
  DatePicker,
  Modal,
  Form,
  Input,
  InputNumber,
  Radio,
  Select,
  Empty,
  Popconfirm,
  Spin,
  App,
  Calendar,
  Badge,
} from "antd";
import type { CalendarProps, FormProps } from "antd";
import {
  PlusOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  WalletOutlined,
  DeleteOutlined,
  LogoutOutlined,
  EditOutlined,
  CopyOutlined,
  BookOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import dayjs, { Dayjs } from "dayjs";
import { useTranslation } from "react-i18next";
import { categoryService, Category } from "../services/categoryService";
import {
  transactionService,
  Transaction,
  TransactionStats,
} from "../services/transactionService";
import LanguageSwitcher from "./LanguageSwitcher";
import { formatNumber, formatCompactNumber } from "../utils/format";

// Form field type
type TransactionFieldType = {
  type: "income" | "expense";
  amount: number;
  category: string;
  note?: string;
  date: Dayjs;
};

interface DashboardProps {
  userCode: string;
  onLogout: () => void;
}

export default function Dashboard({ userCode, onLogout }: DashboardProps) {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Mặc định chọn từ đầu tháng đến cuối tháng hiện tại
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().startOf("month"),
    dayjs().endOf("month"),
  ]);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  // Ant Design Form
  const [form] = Form.useForm<TransactionFieldType>();

  const [transactionType, setTransactionType] = useState<"income" | "expense">(
    "expense"
  );

  // Categories từ API
  const [incomeCategories, setIncomeCategories] = useState<Category[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Stats
  const [stats, setStats] = useState<TransactionStats>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    startDate: "",
    endDate: "",
  });

  // Copy user code
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(userCode);
      message.success(t("dashboard.codeCopied"));
    } catch {
      message.error(t("dashboard.copyFailed"));
    }
  };

  // Load categories from API
  const loadCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
      const [incomeRes, expenseRes] = await Promise.all([
        categoryService.getCategories("income"),
        categoryService.getCategories("expense"),
      ]);
      if (incomeRes.success && incomeRes.data) {
        setIncomeCategories(incomeRes.data);
      }
      if (expenseRes.success && expenseRes.data) {
        setExpenseCategories(expenseRes.data);
      }
    } catch {
      message.error(t("dashboard.messages.loadFailed"));
    } finally {
      setLoadingCategories(false);
    }
  }, [t]);

  // Load transactions from API
  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await transactionService.getTransactions({
        startDate: dateRange[0].format("YYYY-MM-DD"),
        endDate: dateRange[1].format("YYYY-MM-DD"),
      });
      if (response.success && response.data) {
        setTransactions(response.data);
      }
    } catch {
      message.error(t("dashboard.messages.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [dateRange, t]);

  // Load stats from API
  const loadStats = useCallback(async () => {
    try {
      const response = await transactionService.getStats(
        dateRange[0].format("YYYY-MM-DD"),
        dateRange[1].format("YYYY-MM-DD")
      );
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch {
      // Silently fail
    }
  }, [dateRange]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadTransactions();
    loadStats();
  }, [loadTransactions, loadStats]);

  // Thêm category mới qua API
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;

    const trimmed = newCategoryName.trim();

    // Check if category exists
    const checkRes = await categoryService.checkExists(
      trimmed,
      transactionType
    );
    if (checkRes.success && checkRes.data?.exists) {
      message.warning(t("dashboard.messages.categoryFailed"));
      return;
    }

    const result = await categoryService.createCategory({
      name: trimmed,
      type: transactionType,
    });

    if (result.success && result.data) {
      if (transactionType === "income") {
        setIncomeCategories([...incomeCategories, result.data]);
      } else {
        setExpenseCategories([...expenseCategories, result.data]);
      }
      setNewCategoryName("");
      form.setFieldValue("category", result.data.name);
      message.success(t("dashboard.messages.categoryAdded"));
    } else {
      message.error(result.error || t("dashboard.messages.categoryFailed"));
    }
  };

  // Format date range for display
  const dateRangeLabel = useMemo(() => {
    const start = dateRange[0];
    const end = dateRange[1];
    // Nếu là cùng tháng và từ đầu đến cuối tháng
    if (
      start.date() === 1 &&
      end.date() === end.daysInMonth() &&
      start.month() === end.month() &&
      start.year() === end.year()
    ) {
      return `Tháng ${start.format("MM/YYYY")}`;
    }
    return `${start.format("DD/MM/YYYY")} - ${end.format("DD/MM/YYYY")}`;
  }, [dateRange]);

  const handleAddTransaction = () => {
    setEditingTransaction(null);
    setTransactionType("expense");
    form.resetFields();
    form.setFieldsValue({
      type: "expense",
      date: dayjs(),
    });
    setIsModalOpen(true);
  };

  const handleEditTransaction = (record: Transaction) => {
    setEditingTransaction(record);
    setTransactionType(record.type);
    form.setFieldsValue({
      type: record.type,
      amount: record.amount,
      category: record.categoryName,
      note: record.note,
      date: dayjs(record.transactionDate),
    });
    setIsModalOpen(true);
  };

  const handleDeleteTransaction = async (id: number) => {
    try {
      const response = await transactionService.deleteTransaction(id);
      if (response.success) {
        message.success(t("dashboard.messages.deleted"));
        loadTransactions();
        loadStats();
      } else {
        message.error(response.error || t("dashboard.messages.deleteFailed"));
      }
    } catch {
      message.error(t("dashboard.messages.deleteFailed"));
    }
  };

  // Form handlers
  const onFinish: FormProps<TransactionFieldType>["onFinish"] = async (
    values
  ) => {
    setSubmitting(true);
    try {
      // Find category by name to get categoryId
      const categories =
        values.type === "income" ? incomeCategories : expenseCategories;
      const category = categories.find((c) => c.name === values.category);

      if (!category) {
        message.error("Danh mục không hợp lệ");
        setSubmitting(false);
        return;
      }

      const transactionData = {
        type: values.type,
        amount: values.amount,
        categoryId: category.id,
        note: values.note,
        transactionDate: values.date.format("YYYY-MM-DD"),
      };

      if (editingTransaction) {
        const response = await transactionService.updateTransaction(
          editingTransaction.id,
          transactionData
        );
        if (response.success) {
          message.success(t("dashboard.messages.updated"));
        } else {
          message.error(response.error || t("dashboard.messages.updateFailed"));
          setSubmitting(false);
          return;
        }
      } else {
        const response = await transactionService.createTransaction(
          transactionData
        );
        if (response.success) {
          message.success(t("dashboard.messages.added"));
        } else {
          message.error(response.error || t("dashboard.messages.addFailed"));
          setSubmitting(false);
          return;
        }
      }

      setIsModalOpen(false);
      form.resetFields();
      loadTransactions();
      loadStats();
    } catch {
      message.error("Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  const onFinishFailed: FormProps<TransactionFieldType>["onFinishFailed"] = (
    errorInfo
  ) => {
    // Form validation failed - errors shown in UI
  };

  // Calculate daily totals for calendar display
  const dailyTotals = useMemo(() => {
    const totals: Record<string, { income: number; expense: number }> = {};
    transactions.forEach((tx) => {
      const dateKey = dayjs(tx.transactionDate).format("YYYY-MM-DD");
      if (!totals[dateKey]) {
        totals[dateKey] = { income: 0, expense: 0 };
      }
      const amount = Number(tx.amount) || 0; // Convert string to number
      if (tx.type === "income") {
        totals[dateKey].income += amount;
      } else {
        totals[dateKey].expense += amount;
      }
    });
    return totals;
  }, [transactions]);

  // Calculate monthly totals for Year view calendar
  const monthlyTotals = useMemo(() => {
    const totals: Record<string, { income: number; expense: number }> = {};
    transactions.forEach((tx) => {
      const monthKey = dayjs(tx.transactionDate).format("YYYY-MM");
      if (!totals[monthKey]) {
        totals[monthKey] = { income: 0, expense: 0 };
      }
      const amount = Number(tx.amount) || 0;
      if (tx.type === "income") {
        totals[monthKey].income += amount;
      } else {
        totals[monthKey].expense += amount;
      }
    });
    return totals;
  }, [transactions]);

  // Filter transactions by selected date
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => dayjs(tx.transactionDate).isSame(selectedDate, "day"))
      .sort(
        (a, b) =>
          dayjs(b.transactionDate).valueOf() -
          dayjs(a.transactionDate).valueOf()
      );
  }, [transactions, selectedDate]);

  // Calendar cell renderer - show all transactions for the date
  const getTransactionsForDate = (value: Dayjs) => {
    const dateKey = value.format("YYYY-MM-DD");
    return transactions.filter(
      (tx) => dayjs(tx.transactionDate).format("YYYY-MM-DD") === dateKey
    );
  };

  // Mobile: compact view with dots
  const dateCellRenderMobile = (value: Dayjs) => {
    const dateKey = value.format("YYYY-MM-DD");
    const dayData = dailyTotals[dateKey];
    if (!dayData) return null;

    return (
      <div className="mobile-dots">
        {dayData.income > 0 && <span className="dot dot-income"></span>}
        {dayData.expense > 0 && <span className="dot dot-expense"></span>}
      </div>
    );
  };

  // Desktop: fullscreen view with transaction list (like Ant Design example)
  const dateCellRenderDesktop = (value: Dayjs) => {
    const dayTransactions = getTransactionsForDate(value);
    if (dayTransactions.length === 0) return null;

    return (
      <ul className="events">
        {dayTransactions.map((tx) => (
          <li key={tx.id}>
            <Badge
              status={tx.type === "income" ? "success" : "error"}
              text={`${tx.type === "income" ? "+" : "-"}${formatNumber(
                Number(tx.amount)
              )}`}
            />
          </li>
        ))}
      </ul>
    );
  };

  // Month cell render for Year view
  const monthCellRender = (value: Dayjs) => {
    const monthKey = value.format("YYYY-MM");
    const monthData = monthlyTotals[monthKey];
    const income = monthData?.income || 0;
    const expense = monthData?.expense || 0;

    return (
      <div className="notes-month">
        <span className="month-income">{formatCompactNumber(income)}</span>
        <span className="month-separator"> / </span>
        <span className="month-expense">{formatCompactNumber(expense)}</span>
      </div>
    );
  };

  const cellRenderMobile: CalendarProps<Dayjs>["cellRender"] = (
    current,
    info
  ) => {
    if (info.type === "date") {
      return dateCellRenderMobile(current);
    }
    if (info.type === "month") {
      return monthCellRender(current);
    }
    return info.originNode;
  };

  const cellRenderDesktop: CalendarProps<Dayjs>["cellRender"] = (
    current,
    info
  ) => {
    if (info.type === "date") {
      return dateCellRenderDesktop(current);
    }
    if (info.type === "month") {
      return monthCellRender(current);
    }
    return info.originNode;
  };

  // Handle calendar date select
  const onCalendarSelect = (date: Dayjs) => {
    setSelectedDate(date);

    // Update date range to show the month of selected date
    if (!date.isSame(dateRange[0], "month")) {
      setDateRange([date.startOf("month"), date.endOf("month")]);
    }
  };

  // Handle calendar panel change (month/year navigation)
  const onPanelChange = (date: Dayjs) => {
    setDateRange([date.startOf("month"), date.endOf("month")]);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header - Fixed height, not sticky */}
      <header className="bg-blue-500 px-4 py-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WalletOutlined className="text-xl" />
            <span className="font-semibold">{t("app.name")}</span>
          </div>
          <div className="flex items-center gap-1">
            <LanguageSwitcher variant="light" />
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={onLogout}
              className="!text-white/80 hover:!text-white"
              size="small"
            />
          </div>
        </div>
        <p className="mt-1 text-xs text-blue-100 flex items-center gap-1">
          Code: {userCode}
          <Button
            type="text"
            size="small"
            icon={<CopyOutlined />}
            onClick={handleCopyCode}
            className="!text-blue-200 hover:!text-white !p-0 !h-4 !w-4 !min-w-0"
          />
        </p>
      </header>

      {/* Main Content with padding for floating button */}
      <div className="px-4 pb-24 pt-4">
        {/* Stats Card */}
        <div className="rounded-2xl bg-white p-4 shadow-md">
          {/* Balance - Monthly */}
          <div className="mb-3 text-center">
            <p className="text-xs text-gray-500">
              {t("dashboard.balance")} ({dateRangeLabel})
            </p>
            <p
              className={`text-xl font-bold ${
                stats.balance >= 0 ? "text-blue-600" : "text-red-500"
              }`}
            >
              {stats.balance >= 0 ? "+" : ""}
              {formatNumber(stats.balance)}
            </p>
          </div>

          {/* Monthly Income & Expense */}
          <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100">
                <ArrowDownOutlined className="text-sm text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{t("dashboard.income")}</p>
                <p className="text-sm font-semibold text-green-600">
                  +{formatNumber(stats.totalIncome)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100">
                <ArrowUpOutlined className="text-sm text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">
                  {t("dashboard.expense")}
                </p>
                <p className="text-sm font-semibold text-red-600">
                  -{formatNumber(stats.totalExpense)}
                </p>
              </div>
            </div>
          </div>

          {/* Daily Stats for Selected Date */}
          <div className="mt-3 border-t border-gray-100 pt-3">
            <p className="text-xs text-gray-500 text-center mb-2">
              {selectedDate.format("DD/MM/YYYY")}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-2 bg-green-50 rounded-lg">
                <p className="text-xs text-gray-500">{t("dashboard.income")}</p>
                <p className="text-sm font-semibold text-green-600">
                  +
                  {formatNumber(
                    dailyTotals[selectedDate.format("YYYY-MM-DD")]?.income || 0
                  )}
                </p>
              </div>
              <div className="text-center p-2 bg-red-50 rounded-lg">
                <p className="text-xs text-gray-500">
                  {t("dashboard.expense")}
                </p>
                <p className="text-sm font-semibold text-red-600">
                  -
                  {formatNumber(
                    dailyTotals[selectedDate.format("YYYY-MM-DD")]?.expense || 0
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar View */}
        {/* Mobile: Compact Calendar */}
        <div className="mt-4 rounded-2xl bg-white p-2 shadow-md md:hidden">
          <Calendar
            fullscreen={false}
            value={selectedDate}
            onSelect={onCalendarSelect}
            onPanelChange={onPanelChange}
            cellRender={cellRenderMobile}
            className="mobile-calendar"
          />
        </div>

        {/* Desktop: Fullscreen Calendar like Ant Design example */}
        <div className="mt-4 rounded-2xl bg-white p-4 shadow-md hidden md:block">
          <Calendar
            value={selectedDate}
            onSelect={onCalendarSelect}
            onPanelChange={onPanelChange}
            cellRender={cellRenderDesktop}
            className="desktop-calendar"
          />
        </div>

        {/* Transaction List for Selected Date */}
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">
              {t("dashboard.transactions")} ({filteredTransactions.length})
            </h2>
            <span className="text-xs text-gray-500 font-medium">
              {selectedDate.format("DD/MM/YYYY")}
            </span>
          </div>

          {loading ? (
            <div className="rounded-xl bg-white p-8 shadow-sm flex justify-center">
              <Spin />
            </div>
          ) : filteredTransactions.length > 0 ? (
            <div className="space-y-2">
              {filteredTransactions.map((tx) => (
                <div key={tx.id} className="rounded-xl bg-white p-3 shadow-sm">
                  {/* Row 1: Category, Type, Amount */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                          tx.type === "income" ? "bg-green-100" : "bg-red-100"
                        }`}
                      >
                        {tx.type === "income" ? (
                          <ArrowDownOutlined className="text-sm text-green-600" />
                        ) : (
                          <ArrowUpOutlined className="text-sm text-red-600" />
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-800">
                        {tx.categoryName}
                      </span>
                      <Tag
                        color={tx.type === "income" ? "green" : "red"}
                        className="!m-0 !text-xs !leading-tight"
                      >
                        {tx.type === "income"
                          ? t("dashboard.income")
                          : t("dashboard.expense")}
                      </Tag>
                    </div>
                    <span
                      className={`text-sm font-semibold ${
                        tx.type === "income" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {tx.type === "income" ? "+" : "-"}
                      {formatNumber(tx.amount)}
                    </span>
                  </div>

                  {/* Row 2: Date, Note, Actions */}
                  <div className="mt-2 flex items-center justify-between border-t border-gray-50 pt-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500">
                        {dayjs(tx.transactionDate).format("DD/MM/YYYY")}
                      </p>
                      <p className="truncate text-xs text-gray-400">
                        {tx.note || t("dashboard.noTransactions")}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined className="!text-gray-400" />}
                        onClick={() => handleEditTransaction(tx)}
                        className="!h-7 !w-7 !min-w-0 !p-0"
                      />
                      <Popconfirm
                        title={t("dashboard.confirm.deleteTitle")}
                        onConfirm={() => handleDeleteTransaction(tx.id)}
                        okText={t("dashboard.confirm.deleteOk")}
                        cancelText={t("dashboard.confirm.deleteCancel")}
                      >
                        <Button
                          type="text"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          className="!h-7 !w-7 !min-w-0 !p-0"
                        />
                      </Popconfirm>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl bg-white p-8 shadow-sm">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={t("dashboard.noTransactions")}
              />
            </div>
          )}
        </div>
      </div>

      {/* Floating Buttons */}
      <div className="fixed bottom-6 left-0 right-0 z-10 flex justify-center gap-2 px-4">
        <Link href="/huong-dan">
          <Button
            size="large"
            icon={<BookOutlined className="!text-blue-500" />}
            className="!h-12 !w-12 !rounded-full !shadow-lg !bg-white !border-0 !flex !items-center !justify-center hover:!bg-blue-50"
          />
        </Link>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={handleAddTransaction}
          className="!h-12 !rounded-full !px-6 !font-semibold !shadow-lg"
        >
          {t("dashboard.addTransaction")}
        </Button>
      </div>

      {/* Add/Edit Transaction Modal */}
      <Modal
        title={
          editingTransaction
            ? t("dashboard.editTransaction")
            : t("dashboard.addTransaction")
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnHidden={false}
        centered
        width="90%"
        style={{ maxWidth: 400 }}
        styles={{ body: { padding: "16px 0" } }}
      >
        <Form<TransactionFieldType>
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          initialValues={{
            type: "expense",
            date: dayjs(),
          }}
        >
          <Form.Item<TransactionFieldType>
            name="type"
            label={t("dashboard.form.type")}
          >
            <Radio.Group
              onChange={(e) => {
                const newType = e.target.value;
                setTransactionType(newType);
                form.setFieldValue("category", undefined);
              }}
              className="w-full"
            >
              <Radio.Button value="expense" className="w-1/2 text-center">
                {t("dashboard.form.expenseType")}
              </Radio.Button>
              <Radio.Button value="income" className="w-1/2 text-center">
                {t("dashboard.form.incomeType")}
              </Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item<TransactionFieldType>
            name="amount"
            label={t("dashboard.form.amount")}
            rules={[
              {
                required: true,
                message: t("dashboard.form.amountPlaceholder"),
              },
            ]}
          >
            <InputNumber<number>
              style={{ width: "100%" }}
              size="large"
              min={0}
              controls={false}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => Number(value?.replace(/\$\s?|(,*)/g, "") || 0)}
              placeholder={t("dashboard.form.amountPlaceholder")}
              className="!text-2xl !font-semibold"
              inputMode="numeric"
            />
          </Form.Item>

          <Form.Item<TransactionFieldType>
            name="category"
            label={t("dashboard.form.category")}
            rules={[
              {
                required: true,
                message: t("dashboard.form.categoryPlaceholder"),
              },
            ]}
          >
            <Select
              size="large"
              placeholder={t("dashboard.form.categoryPlaceholder")}
              loading={loadingCategories}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              onSearch={setNewCategoryName}
              options={(transactionType === "income"
                ? incomeCategories
                : expenseCategories
              ).map((cat) => ({ label: cat.name, value: cat.name }))}
              notFoundContent={
                newCategoryName.trim() ? (
                  <Button
                    type="link"
                    icon={<PlusOutlined />}
                    onClick={handleAddCategory}
                    className="w-full text-left"
                  >
                    {t("dashboard.form.addCategory")} "{newCategoryName.trim()}"
                  </Button>
                ) : (
                  <span className="text-gray-400">
                    {t("dashboard.form.categoryPlaceholder")}
                  </span>
                )
              }
            />
          </Form.Item>

          <Form.Item<TransactionFieldType>
            name="date"
            label={t("dashboard.form.date")}
            rules={[{ required: true, message: t("dashboard.form.date") }]}
          >
            <DatePicker
              className="w-full"
              size="large"
              format="DD/MM/YYYY"
              placeholder={t("dashboard.form.date")}
            />
          </Form.Item>

          <Form.Item<TransactionFieldType>
            name="note"
            label={t("dashboard.form.note")}
          >
            <Input.TextArea
              rows={2}
              placeholder={t("dashboard.form.notePlaceholder")}
              maxLength={200}
              showCount
            />
          </Form.Item>

          <Form.Item label={null} className="mb-0">
            <div className="flex gap-3">
              <Button block onClick={() => setIsModalOpen(false)}>
                {t("dashboard.form.cancel")}
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={submitting}
              >
                {t("dashboard.form.save")}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
