module.exports = (
  x = 32, left = '', right = '',
  al = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
) => {
  for (let i = 0; i < x; ++i)
    left += al.charAt(Math.floor(Math.random() * al.length))
  return left+right
}
