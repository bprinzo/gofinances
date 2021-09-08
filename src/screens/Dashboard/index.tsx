import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';

import { useFocusEffect } from '@react-navigation/core';
import { useTheme } from 'styled-components';

import { HighlightCard } from '../../components/HighlightCard';
import {
  TransactionCard,
  TransactionCardProps,
} from '../../components/TransactionCard';

import {
  Container,
  Header,
  UserInfo,
  Photo,
  User,
  UserGreeting,
  UserName,
  UserWrapper,
  Icon,
  HighlightCards,
  Transactions,
  Title,
  TransactionList,
  LogoutButton,
  TitleContainer,
  RemoveButton,
  LoadContainer,
} from './styles';
import { useAuth } from '../../hooks/auth';

export interface DataListProps extends TransactionCardProps {
  id: string;
}

interface HistoryListProps {
  amount: string;
  lastTransaction: string;
}

interface HighlightData {
  entries: HistoryListProps;
  expenses: HistoryListProps;
  total: HistoryListProps;
}

export function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<DataListProps[]>();
  const [highlightData, setHighlightData] = useState<HighlightData>({
    entries: {
      amount: 'R$0,00',
      lastTransaction: '',
    },
    expenses: {
      amount: 'R$0,00',
      lastTransaction: '',
    },
    total: {
      amount: 'R$0,00',
      lastTransaction: '',
    },
  });

  const { user, signOut } = useAuth();
  const theme = useTheme();

  function getLastTransactionDate(
    collection: DataListProps[],
    type: 'positive' | 'negative' | 'total'
  ) {
    const collectionFiltered = collection.filter((transaction) =>
      type === 'total' ? true : transaction.type === type
    );

    if (collectionFiltered.length === 0) {
      return collectionFiltered.length;
    }

    const lastTransactions = new Date(
      Math.max.apply(
        Math,
        collectionFiltered.map((transaction: DataListProps) =>
          new Date(transaction.date).getTime()
        )
      )
    );

    return `${lastTransactions.getDate()} de ${lastTransactions.toLocaleString(
      'pt-BR',
      {
        month: 'long',
      }
    )}`;
  }

  async function loadTransactions() {
    const dataKey = `@gofinances:transactions_user:${user.id}`;
    const response = await AsyncStorage.getItem(dataKey);
    const transactions = response ? JSON.parse(response) : [];

    let entriesTotal = 0;
    let expensesTotal = 0;

    const transactionsFormatted: DataListProps[] = transactions.map(
      (item: DataListProps) => {
        if (item.type === 'positive') {
          entriesTotal += Number(item.amount);
        }

        if (item.type === 'negative') {
          expensesTotal += Number(item.amount);
        }

        const amount = Number(item.amount).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        });

        const dateFormatted = Intl.DateTimeFormat('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit',
        }).format(new Date(item.date));

        return {
          id: item.id,
          name: item.name,
          amount,
          type: item.type,
          category: item.category,
          date: dateFormatted,
        };
      }
    );

    setTransactions(transactionsFormatted);

    const lastTransactionsEntries = getLastTransactionDate(
      transactions,
      'positive'
    );

    const lastTransactionsExpenses = getLastTransactionDate(
      transactions,
      'negative'
    );

    const totalInterval = getLastTransactionDate(transactions, 'total');

    const total = entriesTotal - expensesTotal;

    setHighlightData({
      entries: {
        amount: entriesTotal.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }),
        lastTransaction: lastTransactionsEntries
          ? `Última entrada dia ${lastTransactionsEntries}`
          : 'Não há transações',
      },
      expenses: {
        amount: expensesTotal.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }),
        lastTransaction: lastTransactionsExpenses
          ? `Última saída dia ${lastTransactionsExpenses}`
          : 'Não há transações',
      },
      total: {
        amount: total.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }),
        lastTransaction: totalInterval
          ? `1 a ${totalInterval}`
          : 'Não há transações',
      },
    });
    setIsLoading(false);
  }

  async function handleClearList() {
    const dataKey = `@gofinances:transactions_user:${user.id}`;

    await AsyncStorage.removeItem(dataKey);

    setTransactions([]);
    setHighlightData({
      entries: {
        amount: 'R$0,00',
        lastTransaction: '',
      },
      expenses: {
        amount: 'R$0,00',
        lastTransaction: '',
      },
      total: {
        amount: 'R$0,00',
        lastTransaction: '',
      },
    });
  }

  useEffect(() => {
    loadTransactions();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [])
  );

  return (
    <Container>
      {isLoading ? (
        <LoadContainer>
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </LoadContainer>
      ) : (
        <>
          <Header>
            <UserWrapper>
              <UserInfo>
                <Photo source={{ uri: user.photo }} />
                <User>
                  <UserGreeting>Olá, </UserGreeting>
                  <UserName>{user.name}</UserName>
                </User>
              </UserInfo>
              <LogoutButton onPress={signOut}>
                <Icon name="power" />
              </LogoutButton>
            </UserWrapper>
          </Header>
          <HighlightCards>
            <HighlightCard
              title="Total"
              amount={highlightData.total.amount}
              lastTransaction={highlightData.total.lastTransaction}
              type="total"
            />
            <HighlightCard
              title="Entradas"
              amount={highlightData.entries.amount}
              lastTransaction={highlightData.entries.lastTransaction}
              type="up"
            />
            <HighlightCard
              title="Saidas"
              amount={highlightData.expenses.amount}
              lastTransaction={highlightData.expenses.lastTransaction}
              type="down"
            />
          </HighlightCards>
          <Transactions>
            <TitleContainer>
              <Title>Listagem</Title>
              <RemoveButton onPress={handleClearList}>
                <Icon name="trash" />
              </RemoveButton>
            </TitleContainer>

            <TransactionList
              data={transactions}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <TransactionCard data={item} />}
            />
          </Transactions>
        </>
      )}
    </Container>
  );
}
