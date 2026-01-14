// src/utils/string.js

/**
 * Normaliza uma string para comparação, removendo acentos e convertendo para minúsculas.
 * Lida com segurança com entradas que não são strings (null, undefined).
 * @param {string | null | undefined} str A string a ser normalizada.
 * @returns {string} A string normalizada ou uma string vazia se a entrada for inválida.
 */
export const normalizeString = (str) => {
  // Garante que a função não quebre se a entrada for inválida.
  if (typeof str !== 'string' || !str) {
    return "";
  }

  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};