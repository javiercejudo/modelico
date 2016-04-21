'use strict';

module.exports = (should, M) => () => {
  const p = M.proxyDate;

  it('should make Date methods available to Modelico Date', () => {
    const date = p(new M.Date(new Date('1988-04-16T00:00:00.000Z')));

    date.setFullYear(2015).getFullYear()
      .should.be.exactly(2015);

    date.getFullYear()
      .should.be.exactly(1988);

    date.getMonth()
      .should.be.exactly(3);
  });
};
