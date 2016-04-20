'use strict';

module.exports = (should, M) => () => {
  const p = M.proxyDate;

  it('should make Date methods available to Modelico Date', () => {
    const date = p(new M.Date(new Date('1988-04-16T00:00:00.000Z')));

    date.getFullYear()
      .should.be.exactly(1988);

    date.getMonth()
      .should.be.exactly(3);
  });
};
