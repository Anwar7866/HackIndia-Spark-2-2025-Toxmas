import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { saveAs } from 'file-saver';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';
import { Container, Card, Grid, Button, TextInput, Title, Table, Text } from '@mantine/core';

// Register chart.js modules
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

function App() {
    const [incomeData, setIncomeData] = useState<{ Source: string; Amount: number; Date: string }[]>(() =>
        JSON.parse(localStorage.getItem('incomeData') || '[]')
    );
    const [expenseData, setExpenseData] = useState<{ Source: string; Amount: number; Date: string }[]>(() =>
        JSON.parse(localStorage.getItem('expenseData') || '[]')
    );
    const [monthlySummary, setMonthlySummary] = useState<Record<string, { Income: number; Expenses: number; Net: number }>>(
        () => JSON.parse(localStorage.getItem('monthlySummary') || '{}')
    );

    const updateMonthlySummary = (date: string, amount: number, isIncome = true) => {
        const validDate = new Date(date);
        if (isNaN(validDate.getTime())) return; // Skip if date is invalid

        const month = validDate.toISOString().slice(0, 10); // Format as YYYY-MM-DD
        setMonthlySummary(prevSummary => {
            const updatedSummary = { ...prevSummary };
            if (!updatedSummary[month]) {
                updatedSummary[month] = { Income: 0, Expenses: 0, Net: 0 };
            }

            if (isIncome) {
                updatedSummary[month].Income += amount;
            } else {
                updatedSummary[month].Expenses += amount;
            }

            updatedSummary[month].Net = updatedSummary[month].Income - updatedSummary[month].Expenses;
            return updatedSummary;
        });
    };

    const handleAddIncome = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newIncome = {
            Source: formData.get('source') as string,
            Amount: parseFloat(formData.get('amount') as string),
            Date: formData.get('date') as string,
        };
        setIncomeData(prev => [...prev, newIncome]);
        updateMonthlySummary(newIncome.Date, newIncome.Amount, true);
        e.currentTarget.reset();
    };

    const handleAddExpense = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newExpense = {
            Source: formData.get('source') as string,
            Amount: parseFloat(formData.get('amount') as string),
            Date: formData.get('date') as string,
        };
        setExpenseData(prev => [...prev, newExpense]);
        updateMonthlySummary(newExpense.Date, newExpense.Amount, false);
        e.currentTarget.reset();
    };

    const exportToCSV = () => {
        const data = [
            ...incomeData.map(row => ({ ...row, Type: 'Income' })),
            ...expenseData.map(row => ({ ...row, Type: 'Expense' })),
        ];

        const csv = [
            ['Source', 'Amount', 'Date', 'Type'],
            ...data.map(row => [row.Source, row.Amount, row.Date, row.Type]),
        ]
            .map(row => row.join(','))
            .join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, 'financial_data.csv');
    };

    useEffect(() => {
        localStorage.setItem('incomeData', JSON.stringify(incomeData));
        localStorage.setItem('expenseData', JSON.stringify(expenseData));
        localStorage.setItem('monthlySummary', JSON.stringify(monthlySummary));
    }, [incomeData, expenseData, monthlySummary]);

    const chartData = {
        labels: Object.keys(monthlySummary),
        datasets: [
            {
                label: 'Income',
                data: Object.values(monthlySummary).map(data => data.Income),
                borderColor: 'green',
                tension: 0.4, // Smooth lines
            },
            {
                label: 'Expenses',
                data: Object.values(monthlySummary).map(data => data.Expenses),
                borderColor: 'red',
                tension: 0.4,
            },
        ],
    };

    return (
        <Container py="xl" style={{ paddingBottom: '8rem', backgroundColor: '#F4F4F9' }}>
            <Title align="center" mb="md" style={{ fontWeight: 'bold', color: '#2C3E50', fontSize: '2.5rem' }}>
                Finance Dashboard
            </Title>

            <Grid gutter="xl">
                <Grid.Col span={12} md={6}>
                    <Card shadow="md" padding="lg" radius="md" style={{ background: 'linear-gradient(135deg, #ABEBC6, #82E0AA)' }}>
                        <Title order={3} align="center" style={{ marginBottom: '1rem', color: '#145A32' }}>
                            Add Income
                        </Title>
                        <form onSubmit={handleAddIncome}>
                            <TextInput name="amount" label="Amount" type="number" required mb="md" />
                            <TextInput name="source" label="Source" required mb="md" />
                            <TextInput name="date" label="Date" type="date" required mb="md" />
                            <Button type="submit" fullWidth color="green">
                                Add Income
                            </Button>
                        </form>
                    </Card>
                </Grid.Col>

                <Grid.Col span={12} md={6}>
                    <Card shadow="md" padding="lg" radius="md" style={{ background: 'linear-gradient(135deg, #F5B7B1, #F1948A)' }}>
                        <Title order={3} align="center" style={{ marginBottom: '1rem', color: '#922B21' }}>
                            Add Expense
                        </Title>
                        <form onSubmit={handleAddExpense}>
                            <TextInput name="amount" label="Amount" type="number" required mb="md" />
                            <TextInput name="source" label="Source" required mb="md" />
                            <TextInput name="date" label="Date" type="date" required mb="md" />
                            <Button type="submit" fullWidth color="red">
                                Add Expense
                            </Button>
                        </form>
                    </Card>
                </Grid.Col>
            </Grid>

            <div className="mt-4">
                <Title order={3} style={{ margin: '2rem', color: '#2C3E50' }}>
                    Income vs Expenses
                </Title>
                <Line data={chartData} />
            </div>

            <Grid gutter="xl" mt="xl">
                <Grid.Col span={12} md={6}>
                    <Card shadow="sm" padding="md" radius="md" style={{ backgroundColor: '#E8F6F3' }}>
                        <Title order={3} align="center" style={{ marginBottom: '1rem', color: '#1A5276' }}>
                            Income
                        </Title>
                        <Table>
                            <thead>
                                <tr>
                                    <th>Source</th>
                                    <th>Amount</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {incomeData.map((row, index) => (
                                    <tr key={index}>
                                        <td>{row.Source}</td>
                                        <td>{row.Amount}</td>
                                        <td>{row.Date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card>
                </Grid.Col>

                <Grid.Col span={12} md={6}>
                    <Card shadow="sm" padding="md" radius="md" style={{ backgroundColor: '#FADBD8' }}>
                        <Title order={3} align="center" style={{ marginBottom: '1rem', color: '#222' }}>
                            Expenses
                        </Title>
                        <Table>
                            <thead>
                                <tr>
                                    <th>Source</th>
                                    <th>Amount</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenseData.map((row, index) => (
                                    <tr key={index}>
                                        <td>{row.Source}</td>
                                        <td>{row.Amount}</td>
                                        <td>{row.Date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card>
                </Grid.Col>
            </Grid>

            <div className="text-center mt-6">
                <Button onClick={exportToCSV} color="blue" size="lg" style={{ marginTop: "1rem" }}>
                    Export to CSV
                </Button>
            </div>
        </Container>
    );
}

export default App;
