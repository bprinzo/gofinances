import React from 'react';
import { HighlightCard } from '../../components/HighlightCard';

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
} from './styles';

export function Dashboard() {
  return (
    <Container>
      <Header>
        <UserWrapper>
          <UserInfo>
            <Photo source={{ uri: 'https://github.com/bprinzo.png' }} />
            <User>
              <UserGreeting>Olá, </UserGreeting>
              <UserName>Bruno</UserName>
            </User>
          </UserInfo>
          <Icon name="power" />
        </UserWrapper>
      </Header>

      <HighlightCards>
        <HighlightCard
          title="Entradas"
          amount="R$ 17.400,00"
          lastTransaction="Última entrada dia 13 de abril"
          type="up"
        />
        <HighlightCard
          title="Saidas"
          amount="R$ 8.400,00"
          lastTransaction="Última entrada dia 13 de abril"
          type="down"
        />
        <HighlightCard
          title="Total"
          amount="R$ 9.000,00"
          lastTransaction="Última entrada dia 13 de abril"
          type="total"
        />
      </HighlightCards>
    </Container>
  );
}