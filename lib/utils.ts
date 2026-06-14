import type { Product } from './types'

export function slugify(str: string): string {
  const map: Record<string, string> = {
    'а':'a','б':'b','в':'v','г':'h','ґ':'g','д':'d','е':'e','є':'ye','ж':'zh',
    'з':'z','и':'y','і':'i','ї':'yi','й':'y','к':'k','л':'l','м':'m','н':'n',
    'о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'kh','ц':'ts',
    'ч':'ch','ш':'sh','щ':'shch','ь':'','ю':'yu','я':'ya','«':'','»':'',
    ' ':'-','/':'-',
  }
  return str.toLowerCase().split('').map(c => map[c] ?? c).join('')
    .replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

export function calcPrice(product: Product, selections: Record<number, number>): number {
  let total = product.price
  ;(product.options || []).forEach((og, gi) => {
    const vi = selections[gi] ?? 0
    const v = og.values[vi]
    if (v && typeof v.price === 'number') total += v.price
  })
  return Math.max(total, 0)
}

export function formatPrice(n: number): string {
  return n.toLocaleString('uk-UA')
}

export function getBadgeClass(badge: string): string {
  if (badge === 'new') return 'badge-new'
  if (badge === 'sale') return 'badge-sale'
  if (badge === 'top') return 'badge-top'
  return ''
}

export function getBadgeLabel(badge: string): string {
  if (badge === 'new') return 'Новинка'
  if (badge === 'sale') return 'Акція'
  if (badge === 'top') return 'Хіт'
  return ''
}
