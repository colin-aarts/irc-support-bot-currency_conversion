
#	irc-support-bot-currency_conversion
#	-----------------------------------
#	Live currency conversion for irc-support-bot
#	This is an official plug-in
#
#	Provides one bot command: '$'

'use strict'


util    = require 'util'
http    = require 'http'


module.exports = ->

	this.register_special_command do
		name: '$'
		description: 'Perform currency conversion or retrieve exchange rate.'
		admin_only: false
		fn: (event, input-data, output-data) ~>

			api-key = this.bot-options.plugin-options?['irc-support-bot-currency_conversion']?.api-key

			if not api-key
				return console.warn "API key for plug-in « irc-support-bot-currency_conversion » not found"

			if '?' in input-data.flags
				message = '$ <from> <to> [<amount>] • Perform currency conversion or retrieve exchange rate. If <amount> is not specified, shows exchange rate. <from> and <to> must be three-letter country codes.'
			else if not input-data.args
				message = "Insufficient arguments specified for currency conversion command; see #{input-data.trigger}$/? for details"
			else
				args-match = input-data.args.match //
					^
					(\w{3})				# Three-letter country code #1
					\s+
					(\w{3})				# Three-letter country code #2
					(					# Start amount group (optional)
						\s+
						([\d\.,]+)		# 	Amount
					)?
					$
					//

				if not args-match
					message = "Invalid format specified for currency conversion command; see #{input-data.trigger}$/? for details"
				else
					from   = args-match.1.to-upper-case!
					to     = args-match.2.to-upper-case!
					amount = if args-match.4 then args-match.4.replace ',', '.' else ''

					err, result <~ convert from, to, amount, api-key

					result = +result

					if err
						message = 'Oops, something went wrong!'
					if not amount
						message = "Current exchange rate #{from} → #{to} is #{result}"
					else
						message = "#{amount} #{from} is currently #{result} #{to}"

					this.send output-data.method, output-data.recipient, message if message

				this.send output-data.method, output-data.recipient, message if message

			this.send output-data.method, output-data.recipient, message if message


convert = (from, to, amount, api-key, cb) ->

	result = []

	conf =
		hostname: 'www.exchangerate-api.com'
		path: "/#{from}/#{to}/#{amount}?k=#{api-key}"
		method: 'get'

	res-fn = (res) ->
		res.set-encoding 'utf-8'
		res.on 'data', (data) ->
			result.push data
		res.on 'end', ->
			result := result.join ''

			err = true if not result

			cb err, result

	req = http.request conf, res-fn

	req.on 'error', (err) ->
		cb err, null

	req.end!
