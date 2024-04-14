var fromFilter = 'all';
var toFilter = 'all';
var ethPrice = 3000.00;
var maticPrice = 0.90;
var gasPrice = 0;
var quoteRetries = 0;

jQuery(document).ready(function() { 

	addQuotes();
	getGasPrice();
	getEthPrice();

	// 10s delay for updated quotes
	setTimeout(`addQuotes()`,10 * 1000);

	// slide bg gradient upwards 
	setTimeout(`jQuery(".gradient").removeClass("gradient2");`,500);

	// fade in elements
	var fadeDelay = 1000;
	jQuery(".fadeIn").each(function() { 
		var thisId = jQuery(this).attr("id");
		fadeDelay = fadeDelay + 250;
		//console.log(fadeDelay);
		setTimeout(`jQuery("#${thisId}").addClass("visible")`,fadeDelay);
	});

	// filter toggling
	jQuery(".network-logo").click(function() { 
		var thisFilter = jQuery(this).attr("data-href");
		jQuery(".network-logo").removeClass("active");
		jQuery(".network-logo").show();
		if(thisFilter.indexOf('from') > -1) { 
			fromFilter = thisFilter;
			
		} else { 
			toFilter = thisFilter;
		}

		jQuery(`.network-logo[data-href="${fromFilter}"]`).addClass('active');
		jQuery(`.network-logo[data-href="${toFilter}"]`).addClass('active');

		// if a chain is selected, hide that chain on the opposide end (from/to)
		
		var fromChainId = fromFilter.split("_")[1];
		var toChainId = toFilter.split("_")[1];

		jQuery(`.network-logo[data-href="to_${fromChainId}"]`).hide();
		if(jQuery(`.network-logo[data-href="to_${fromChainId}"]`).hasClass("active")) { 
			toFilter = 'all';
		}
		jQuery(`.network-logo[data-href="from_${toChainId}"]`).hide();
		if(jQuery(`.network-logo[data-href="from_${toChainId}"]`).hasClass("active")) { 
			fromFilter = 'all';
		}
		applyFilters();

	});

	jQuery(".clearFilters").click(function() {
		fromFilter = 'all';
		toFilter = 'all';
		jQuery(`.network-logo`).removeClass('active');
		jQuery(`.network-logo`).show();
		applyFilters();
		jQuery("span.chip").remove();
	});

	loadSlick();


});



function chainName(chainId) { 
	if(chainId == 1) return "Ethereum";
	else if(chainId == 10) return "OP Mainnet";
	else if(chainId == 137) return "Polygon (PoS)";
	else if(chainId == 324) return "zkSync Era";
	else if(chainId == 8453) return "Base";
	else if(chainId == 42161) return "Arbitrum One";
	else if(chainId == 59144) return "Linea";
}

function applyFilters() { 

	jQuery("span.chip").remove();

	if(fromFilter == 'all' && toFilter == 'all') { 
		jQuery(".quoteData tr").show();
		jQuery(".quoteData tr").addClass('active');
	} else if(fromFilter != 'all' && toFilter != 'all') { 
		jQuery(".quoteData tr").each(function() {
			
			if(jQuery(this).hasClass(fromFilter) && jQuery(this).hasClass(toFilter)) { 
				jQuery(this).show();
				jQuery(".quoteData tr").addClass('active');
			} else { 
				jQuery(this).hide();
				jQuery(".quoteData tr").removeClass('active');
			}

		});
	} else { 
		
		jQuery(".quoteData tr").each(function() {
			
			if(jQuery(this).hasClass(fromFilter) || jQuery(this).hasClass(toFilter)) { 
				jQuery(this).show();
				jQuery(".quoteData tr").addClass('active');
			} else { 
				jQuery(this).hide();
				jQuery(".quoteData tr").removeClass('active');
			}

		});
	}

	if(fromFilter != 'all' && toFilter != 'all') { 
		// loop through these new entries to find out which one is best
		var bestAmount = 0;
		var bestId = '';
		var fastestTime = 9999;
		var fastestId = '';
		var costAmount = 9999999999999999;
		var costId = '';
		
		jQuery(".quoteData tr:visible").each(function() {
			var thisId = jQuery(this).attr("id");
			var thisAmount = jQuery(this).find(".quotes_youget").html().split(" ")[0] * 1;
        	var thisSpeed = jQuery(this).find(".quotes_eta").html().split(" ")[0] * 1;
			var thisCost = jQuery(this).find(".quotes_totalcost").html().split(" ")[0] * 1;
	
        	if(thisAmount > bestAmount) {
            	bestAmount = thisAmount;
            	bestId = thisId;
        	}
        	if(thisSpeed < fastestTime) {
            	fastestTime = thisSpeed;
            	fastestId = thisId;
        	}
        	if(thisCost < costAmount) {
            	costAmount = thisCost;
            	costId = thisId;
        	}
        	
	
		});
    	
    	jQuery(`#${bestId} .quotes_youget .usdAmount`).append('<span class="chip">Most</span>');
    	jQuery(`#${fastestId} .quotes_eta .usdAmount`).append('<span class="chip">Fastest</span>');
    	jQuery(`#${costId} .quotes_totalcost .usdAmount`).append('<span class="chip">Cheapest</span>');

	}

}



function getGasPrice() { 
	var currentGasPrice = jQuery(".gasPrice-number").html();
	const web3 = new Web3('https://ethereum-rpc.publicnode.com'); 

	web3.eth.getGasPrice()
		.then(gasPrice => {
	  	//console.log(gasPrice);
		var newGasPrice = Math.floor(gasPrice/1000000000);
		jQuery(".gasPrice-number").html(newGasPrice);

		if(newGasPrice < currentGasPrice) {
			jQuery(".gasPrice").addClass("greenFlash");
			setTimeout(`jQuery(".gasPrice").removeClass("greenFlash");`,250);
		} else if(newGasPrice == currentGasPrice) {
			jQuery(".gasPrice").addClass("whiteFlash");
			setTimeout(`jQuery(".gasPrice").removeClass("whiteFlash");`,250);
		} else { 
			jQuery(".gasPrice").addClass("redFlash");
			setTimeout(`jQuery(".gasPrice").removeClass("redFlash");`,250);
		}
		
		})
		.catch(error => {
		console.error('Error fetching the latest gas price:', error);
		});

	setTimeout('getGasPrice()',12000);
}

function getEthPrice() {

	var currentPrice = ethPrice;

	jQuery.get("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD&sid=" + Math.random(), function(prices) { 
		console.log(prices.USD);
		ethPrice = (prices.USD);
		jQuery(".ethPrice-number").html(ethPrice);
		addCommas(".ethPrice-number");
		if(ethPrice > currentPrice) {
			jQuery(".ethPrice").addClass("greenFlash");
			setTimeout(`jQuery(".ethPrice").removeClass("greenFlash");`,250);
		} else if(ethPrice == currentPrice) {
			jQuery(".ethPrice").addClass("whiteFlash");
			setTimeout(`jQuery(".ethPrice").removeClass("whiteFlash");`,250);
		} else { 
			jQuery(".ethPrice").addClass("redFlash");
			setTimeout(`jQuery(".ethPrice").removeClass("redFlash");`,250);
		}
	});

	setTimeout('getEthPrice()',90000);


}



function addCommas(className) {
	jQuery(className).each(function() {
    	var thisNewValue = "$" + (jQuery(this).html().replace("$","")*1).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
		if(thisNewValue != '$NaN') { 
			jQuery(this).html(thisNewValue);
		}
		
	});
}

function loadSlick() {
	jQuery(".action-options").slick({
		prevArrow: '<i class="fa fa-chevron-circle-left"></i>',
		nextArrow: '<i class="fa fa-chevron-circle-right"></i>',
		slidesToScroll: 1,
    	slidesToShow: 6,
		accessibility: true,
		dots: false,
		autoplay: false,

		responsive: [
			{
  				breakpoint: 1450,
  				settings: {
    				slidesToShow: 5
  				}
			},
			{
  				breakpoint: 1200,
  				settings: {
    				slidesToShow: 4
  				}
			},
			{
  			breakpoint: 980,
  				settings: {
    				slidesToShow: 3
  				},
			},
			{
  				breakpoint: 700,
  				settings: {
    				slidesToShow: 2
  				}
			},
			{
  				breakpoint: 540,
  				settings: {
    				slidesToShow: 1
  				}
			}
			]
	
		});

}

function addQuotes() { 
	console.log('Adding "Just Bridge" quotes');
	jQuery.get("https://fees-api.protopin.io:8080/get-quotes", function(rawData) {
		var data = JSON.parse(rawData);
	    jQuery(".quoteData").html('');
		var thisReturnHTML = '';
		
		if(data.totalQuotes == 0 && quoteRetries < 5) { 
			// try again 
			console.log("Quote retrieval failed, trying again");
			quoteRetries = quoteRetries + 1;
			setTimeout("addQuotes();",1000);
		} else if(data.totalQuotes == 0 && quoteRetries >= 5) { 
			alert('Quote retrieval failed. Please try refreshing the page.');
		} else { 
		
			try { 
				ethPrice = data.usdTokenPrices.ETH;
				maticPrice = data.usdTokenPrices.MATIC;
				console.log(`ETH price is ${ethPrice}`);
				console.log(`MATIC price is ${maticPrice}`);
			} catch(err) { }

			for(q=0; q < data.totalQuotes; q++) { 
				var thisQuote = data.records[q];
	
				var thisRouteClean = thisQuote.route.toLowerCase().replace(/\s/g, '');
			
				var thisVia = '';
				var thisButton = `Use ${thisQuote.route}`;
				var thisSource = thisQuote.source + "?ref=0xE7488e7f5c60bfa81D38965c02B4cC5AA6249A11"; 
				if(thisQuote.aggregator) { 
					thisVia = `<span class="via">via <strong>${thisQuote.aggregator}</strong></via>`;
					thisButton = `Use ${thisQuote.aggregator}`;
				}
				
				if(thisSource.indexOf('across.to') > -1) { 
					thisSource = thisQuote.source + "?ref=0xE7488e7f5c60bfa81D38965c02B4cC5AA6249A11"; 
				}

				var txCostUsd = (ethPrice*thisQuote.txCost.value/1000000000000000000).toFixed(2);
				if(thisQuote.txCost.currency == 'MATIC') { 
					txCostUsd = (maticPrice*thisQuote.txCost.value/1000000000000000000).toFixed(2);
				}
				var bridgeFeeUsd = (ethPrice*thisQuote.bridgeFee.value/1000000000000000000).toFixed(2);
				if(thisQuote.bridgeFee.currency == 'MATIC') { 
					bridgeFeeUsd = (maticPrice*thisQuote.bridgeFee.value/1000000000000000000).toFixed(2);
				}
				var totalCostUsd = (ethPrice*thisQuote.totalCost.value/1000000000000000000).toFixed(2);
				if(thisQuote.totalCost.currency == 'MATIC') { 
					totalCostUsd = (maticPrice*thisQuote.totalCost.value/1000000000000000000).toFixed(2);
				}
				var netAmountUsd = (ethPrice*thisQuote.netAmount.value/1000000000000000000).toFixed(2)
				if(thisQuote.netAmount.currency == 'MATIC') { 
					netAmountUsd = (maticPrice*thisQuote.netAmount.value/1000000000000000000).toFixed(2)
				}
				
				var thisLine = `<tr class="from_${thisQuote.from} to_${thisQuote.to} route_${thisRouteClean}" id="quote_row_${q}">`;
					thisLine += `<td class="quotes_route">${thisQuote.route.replace("-"," ")}${thisVia}</td>`;
					thisLine += `<td class="quotes_from chain_${thisQuote.from}">${chainName(thisQuote.from)}</td>`;
					thisLine += `<td class="quotes_to chain_${thisQuote.to}">${chainName(thisQuote.to)}</td>`;
					thisLine += `<td class="quotes_eta">${thisQuote.eta} seconds<span class="usdAmount"></span></td>`;
					thisLine += `<td class="quotes_userfees">${(thisQuote.txCost.value/1000000000000000000).toFixed(6)} ${thisQuote.txCost.currency}<br><span class="usdAmount">$${txCostUsd}</span></td>`;
					thisLine += `<td class="quotes_bridgefees">${(thisQuote.bridgeFee.value/1000000000000000000).toFixed(6)} ${thisQuote.bridgeFee.currency}<br><span class="usdAmount">${bridgeFeeUsd}</span></td>`;
					thisLine += `<td class="quotes_totalcost">${(thisQuote.totalCost.value/1000000000000000000).toFixed(6)} ${thisQuote.totalCost.currency}<br><span class="usdAmount">$${totalCostUsd}</span></td>`;
					thisLine += `<td class="quotes_youget">${(thisQuote.netAmount.value/1000000000000000000).toFixed(6)} ${thisQuote.netAmount.currency}<br><span class="usdAmount">$${netAmountUsd}</span></td>`;
					thisLine += `<td class="quotes_bridgenow"><a href="${thisSource}" target="bridgeLink" class="routeButton">${thisButton}</a></td>`;
				thisLine += `</tr>`;
				
				thisReturnHTML+= thisLine;
			}
			jQuery(".quoteData").html(thisReturnHTML);
			
			jQuery(".tableSorter").tablesorter({
	
				headers: {
  					'.quotes_route, .quotes_bridgenow' : {
    					sorter: false
  					}
				}
				
			});
		
		}

	});
}