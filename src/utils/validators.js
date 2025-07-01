export function isValidCPF(cpf) {
  cpf = cpf.replace(/[^\d]+/g, '')
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false

  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(cpf.charAt(i)) * (10 - i)
  let rev = 11 - (sum % 11)
  if (rev === 10 || rev === 11) rev = 0
  if (rev !== parseInt(cpf.charAt(9))) return false

  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(cpf.charAt(i)) * (11 - i)
  rev = 11 - (sum % 11)
  if (rev === 10 || rev === 11) rev = 0
  return rev === parseInt(cpf.charAt(10))
}

export function isValidCNPJ(cnpj) {
  cnpj = cnpj.replace(/[^\d]+/g, '')
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false

  let t = cnpj.length - 2,
    d = cnpj.substring(t),
    d1 = parseInt(d.charAt(0)),
    d2 = parseInt(d.charAt(1)),
    calc = x => {
      let n = 0,
        y = t + 1
      for (let i = 0; i < t; i++) {
        n += cnpj.charAt(i) * y--
        if (y < 2) y = 9
      }
      let r = n % 11
      return r < 2 ? 0 : 11 - r
    }

  return calc() === d1 && calc() === d2
}
