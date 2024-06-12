import { addDays, format, isWithinInterval, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { http, HttpResponse } from 'msw'

import { GetDailyRevenueInPeriodResponse } from '../get-daily-revenue-in-period'

const dailyRevenues: GetDailyRevenueInPeriodResponse = Array.from({
  length: 60,
}).map((_, i) => {
  return {
    date: format(subDays(new Date(), 60 - 1 - i), 'dd/MM/yyyy', {
      locale: ptBR,
    }),
    receipt: Math.random() * 1000 * (i / 3),
  }
})

export const getDailyRevenueInPeriodMock = http.get<
  never,
  never,
  GetDailyRevenueInPeriodResponse
>('/metrics/daily-receipt-in-period', ({ request }) => {
  const { searchParams } = new URL(request.url)

  const from = searchParams.get('from')
  const to = searchParams.get('to')

  let filteredDailyRevenues = dailyRevenues

  const startDate = from ? new Date(from) : subDays(new Date(), 7)
  const endDate = to ? new Date(to) : from ? addDays(startDate, 7) : new Date()

  filteredDailyRevenues = filteredDailyRevenues.filter((dailyRevenue) => {
    const [day, month, year] = dailyRevenue.date.split('/')

    return isWithinInterval(new Date(`${year}-${month}-${day}`), {
      start: subDays(startDate, 1),
      end: endDate,
    })
  })

  return HttpResponse.json(filteredDailyRevenues)
})
